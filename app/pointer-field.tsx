"use client";

import { useEffect, useRef } from "react";
import { registerFrameTask, requestSharedFrame } from "./frame-loop";

const INTERACTIVE_SELECTOR = "a, button, [role='button']";
const SPACING = 14;
const DOT_RADIUS = 1.1;
const FIELD_RADIUS = 320;
const BASE_OPACITY = 0.1;
const ACTIVE_OPACITY = 0.3;
const TWO_PI = Math.PI * 2;

type DotMotion = {
  x: number;
  documentY: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));

const motionKey = (x: number, documentY: number) => `${x}:${documentY}`;

export default function PointerField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    const media = window.matchMedia(
      "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)",
    );
    if (!canvas || !cursor || !media.matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    document.documentElement.classList.add("pointer-system-active");

    const target = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      opacity: 0,
      vx: 0,
      vy: 0,
      pressed: false,
    };
    const current = { ...target };
    const fieldAnchor = {
      x: target.x,
      documentY: target.y + window.scrollY,
      ready: false,
    };
    const dotMotion = new Map<string, DotMotion>();
    const localKeys = new Set<string>();
    const opacityPaths = Array.from({ length: 11 }, () => new Path2D());
    const tile = document.createElement("canvas");
    let pattern: CanvasPattern | null = null;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    let needsPaint = true;

    const buildPattern = () => {
      tile.width = Math.ceil(SPACING * dpr);
      tile.height = Math.ceil(SPACING * dpr);
      const tileContext = tile.getContext("2d");
      if (!tileContext) return;

      tileContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      tileContext.clearRect(0, 0, SPACING, SPACING);
      tileContext.fillStyle = `rgba(0, 0, 0, ${BASE_OPACITY})`;
      tileContext.beginPath();
      tileContext.arc(0, 0, DOT_RADIUS, 0, TWO_PI);
      tileContext.fill();
      pattern = context.createPattern(tile, "repeat");
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      dotMotion.clear();
      lastScrollY = window.scrollY;
      scrollVelocity = 0;
      buildPattern();
      needsPaint = true;
      requestSharedFrame();
    };

    const addDot = (
      opacityStep: number,
      x: number,
      y: number,
      radius = DOT_RADIUS,
    ) => {
      const path = opacityPaths[opacityStep];
      path.moveTo(x + radius, y);
      path.arc(x, y, radius, 0, TWO_PI);
    };

    const clearRestingDot = (x: number, y: number) => {
      const clearRadius = DOT_RADIUS + 1;
      context.clearRect(
        x - clearRadius,
        y - clearRadius,
        clearRadius * 2,
        clearRadius * 2,
      );
    };

    const updateMotion = (
      motion: DotMotion,
      insidePointer: boolean,
      eased: number,
      fieldX: number,
      fieldY: number,
      fieldCenterX: number,
      fieldCenterY: number,
      pointerSpeed: number,
      rawPointerSpeed: number,
      scrollStrength: number,
    ) => {
      if (insidePointer && pointerSpeed > 0.012 && rawPointerSpeed > 0.1) {
        const travelX = current.vx / rawPointerSpeed;
        const travelY = current.vy / rawPointerSpeed;
        const normalX = -travelY;
        const normalY = travelX;
        const offsetX = fieldX - fieldCenterX;
        const offsetY = fieldY - fieldCenterY;
        const along = offsetX * travelX + offsetY * travelY;
        const across = Math.abs(offsetX * normalX + offsetY * normalY);
        const waveBand = Math.exp(-(along * along) / (2 * 24 * 24));
        const barEnvelope = Math.pow(
          Math.max(0, 1 - across / FIELD_RADIUS),
          0.45,
        );
        const dragGain = target.pressed ? 2.05 : 1;
        const impulse =
          waveBand * barEnvelope * eased * pointerSpeed * dragGain * 1.55;

        motion.vx += travelX * impulse;
        motion.vy += travelY * impulse;
      }

      if (insidePointer && scrollStrength > 0.012) {
        const verticalOffset = fieldY - fieldCenterY;
        const horizontalOffset = Math.abs(fieldX - fieldCenterX);
        const waveBand = Math.exp(
          -(verticalOffset * verticalOffset) / (2 * 30 * 30),
        );
        const barEnvelope = Math.pow(
          Math.max(0, 1 - horizontalOffset / FIELD_RADIUS),
          0.45,
        );
        const impulse =
          waveBand * barEnvelope * eased * scrollStrength * 1.35;
        motion.vy += Math.sign(scrollVelocity) * impulse;
      }

      motion.vx += -motion.dx * 0.035;
      motion.vy += -motion.dy * 0.035;
      motion.vx *= 0.91;
      motion.vy *= 0.91;
      motion.dx = clamp(motion.dx + motion.vx, -18, 18);
      motion.dy = clamp(motion.dy + motion.vy, -18, 18);
    };

    const paintBase = (scrollY: number) => {
      context.clearRect(0, 0, width, height);
      if (!pattern) return;

      const phaseY = -(((scrollY % SPACING) + SPACING) % SPACING);
      context.save();
      context.translate(0, phaseY);
      context.fillStyle = pattern;
      context.fillRect(0, 0, width, height + SPACING);
      context.restore();
    };

    const draw = () => {
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY;
      lastScrollY = scrollY;

      if (Math.abs(scrollDelta) > 0.01) {
        scrollVelocity = clamp(
          scrollVelocity * 0.45 + scrollDelta * 0.55,
          -32,
          32,
        );
      } else {
        scrollVelocity *= 0.82;
      }

      const targetDocumentY = target.y + scrollY;
      if (!fieldAnchor.ready) {
        fieldAnchor.x = target.x;
        fieldAnchor.documentY = targetDocumentY;
      } else {
        fieldAnchor.x += (target.x - fieldAnchor.x) * 0.038;
        fieldAnchor.documentY +=
          (targetDocumentY - fieldAnchor.documentY) * 0.038;
      }

      current.x = fieldAnchor.x;
      current.y = fieldAnchor.documentY - scrollY;
      current.opacity += (target.opacity - current.opacity) * 0.1;
      current.vx += (target.vx - current.vx) * 0.18;
      current.vy += (target.vy - current.vy) * 0.18;
      target.vx *= 0.82;
      target.vy *= 0.82;

      const fieldCenterX = current.x;
      const fieldCenterY = current.y;
      const rawPointerSpeed = Math.hypot(current.vx, current.vy);
      const pointerSpeed = Math.min(rawPointerSpeed, 26) / 26;
      const scrollStrength = Math.min(Math.abs(scrollVelocity), 24) / 24;
      const radiusSquared = FIELD_RADIUS * FIELD_RADIUS;
      const startX =
        Math.floor((fieldCenterX - FIELD_RADIUS) / SPACING) * SPACING;
      const endX =
        Math.ceil((fieldCenterX + FIELD_RADIUS) / SPACING) * SPACING;
      const centerDocumentY = fieldCenterY + scrollY;
      const startDocumentY =
        Math.floor((centerDocumentY - FIELD_RADIUS) / SPACING) * SPACING;
      const endDocumentY =
        Math.ceil((centerDocumentY + FIELD_RADIUS) / SPACING) * SPACING;

      paintBase(scrollY);
      localKeys.clear();
      for (let step = 0; step < opacityPaths.length; step += 1) {
        opacityPaths[step] = new Path2D();
      }

      for (
        let documentY = startDocumentY;
        documentY <= endDocumentY;
        documentY += SPACING
      ) {
        const fieldY = documentY - scrollY;
        if (fieldY < -24 || fieldY > height + 24) continue;

        for (let x = startX; x <= endX; x += SPACING) {
          if (x < -24 || x > width + 24) continue;
          const offsetX = x - fieldCenterX;
          const offsetY = fieldY - fieldCenterY;
          const distanceSquared = offsetX * offsetX + offsetY * offsetY;
          if (distanceSquared > radiusSquared) continue;

          const proximity =
            1 - Math.sqrt(distanceSquared) / FIELD_RADIUS;
          const eased = proximity * proximity * (3 - 2 * proximity);
          const insidePointer = current.opacity > 0.002 && eased > 0;
          const key = motionKey(x, documentY);
          localKeys.add(key);
          let motion = dotMotion.get(key);
          const receivingImpulse =
            pointerSpeed > 0.012 || scrollStrength > 0.012;

          if (insidePointer && receivingImpulse && !motion) {
            motion = { x, documentY, dx: 0, dy: 0, vx: 0, vy: 0 };
            dotMotion.set(key, motion);
          }

          if (motion) {
            updateMotion(
              motion,
              insidePointer,
              eased,
              x,
              fieldY,
              fieldCenterX,
              fieldCenterY,
              pointerSpeed,
              rawPointerSpeed,
              scrollStrength,
            );

            const energy =
              Math.abs(motion.dx) +
              Math.abs(motion.dy) +
              Math.abs(motion.vx) +
              Math.abs(motion.vy);
            if (!receivingImpulse && energy < 0.01) {
              dotMotion.delete(key);
              motion = undefined;
            }
          }

          clearRestingDot(x, fieldY);
          const opacityStep = Math.min(
            10,
            Math.round(current.opacity * eased * 10),
          );
          addDot(
            opacityStep,
            x + (motion?.dx ?? 0),
            fieldY + (motion?.dy ?? 0),
          );
        }
      }

      dotMotion.forEach((motion, key) => {
        if (localKeys.has(key)) return;
        const fieldY = motion.documentY - scrollY;
        updateMotion(
          motion,
          false,
          0,
          motion.x,
          fieldY,
          fieldCenterX,
          fieldCenterY,
          pointerSpeed,
          rawPointerSpeed,
          scrollStrength,
        );

        const energy =
          Math.abs(motion.dx) +
          Math.abs(motion.dy) +
          Math.abs(motion.vx) +
          Math.abs(motion.vy);
        if (energy < 0.01) {
          dotMotion.delete(key);
          return;
        }
        if (fieldY < -24 || fieldY > height + 24) return;

        clearRestingDot(motion.x, fieldY);
        addDot(
          0,
          motion.x + motion.dx,
          fieldY + motion.dy,
        );
      });

      opacityPaths.forEach((path, step) => {
        context.fillStyle = `rgba(0, 0, 0, ${
          BASE_OPACITY +
          (ACTIVE_OPACITY - BASE_OPACITY) * (step / 10)
        })`;
        context.fill(path);
      });

      needsPaint = false;
      const pointerSettling =
        Math.abs(target.opacity - current.opacity) > 0.002 ||
        Math.abs(target.vx) + Math.abs(target.vy) > 0.01 ||
        Math.abs(current.vx) + Math.abs(current.vy) > 0.01;
      const anchorSettling =
        fieldAnchor.ready &&
        (Math.abs(target.x - fieldAnchor.x) > 0.05 ||
          Math.abs(targetDocumentY - fieldAnchor.documentY) > 0.05);
      const scrollSettling = Math.abs(scrollVelocity) > 0.01;

      return (
        needsPaint ||
        pointerSettling ||
        anchorSettling ||
        scrollSettling ||
        dotMotion.size > 0
      );
    };

    const move = (event: PointerEvent) => {
      const entering = target.opacity === 0;
      target.vx = entering
        ? 0
        : clamp(event.clientX - target.x, -32, 32);
      target.vy = entering
        ? 0
        : clamp(event.clientY - target.y, -32, 32);
      target.x = event.clientX;
      target.y = event.clientY;
      target.opacity = 1;
      if (entering) {
        fieldAnchor.x = target.x;
        fieldAnchor.documentY = target.y + window.scrollY;
        fieldAnchor.ready = true;
      }
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      const hovered = document.elementFromPoint(
        event.clientX,
        event.clientY,
      );
      cursor.dataset.interactive = hovered?.closest(INTERACTIVE_SELECTOR)
        ? "true"
        : "false";
      cursor.dataset.visible = "true";
      needsPaint = true;
      requestSharedFrame();
    };

    const leave = () => {
      target.opacity = 0;
      target.vx = 0;
      target.vy = 0;
      cursor.dataset.visible = "false";
      needsPaint = true;
      requestSharedFrame();
    };

    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 1) return;
      target.opacity = 1;
      needsPaint = true;
      requestSharedFrame();
    };

    const down = () => {
      target.pressed = true;
      cursor.dataset.pressed = "true";
      requestSharedFrame();
    };
    const up = () => {
      target.pressed = false;
      cursor.dataset.pressed = "false";
      requestSharedFrame();
    };
    const visibility = () => {
      if (document.hidden) return;
      needsPaint = true;
      requestSharedFrame();
    };

    const unregisterFrame = registerFrameTask(draw);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("wheel", wheel, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", leave);
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });

    return () => {
      unregisterFrame();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("wheel", wheel);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.classList.remove("pointer-system-active");
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="pointer-field" aria-hidden="true" />
      <div ref={cursorRef} className="observation-cursor" aria-hidden="true">
        <span />
      </div>
    </>
  );
}

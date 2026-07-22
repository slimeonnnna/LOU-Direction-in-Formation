"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = "a, button, [role='button']";

type DotMotion = {
  dx: number;
  dy: number;
  vx: number;
  vy: number;
};

type SweepWave = {
  active: boolean;
  ux: number;
  uy: number;
  front: number;
  strength: number;
};

export default function PointerField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    const media = window.matchMedia("(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)");
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
    const dotMotion = new Map<string, DotMotion>();
    const spacing = 18;
    const radius = 220;
    const scrollWave: SweepWave = {
      active: false,
      ux: 0,
      uy: 1,
      front: -radius,
      strength: 0,
    };
    const fieldDrift = { x: 0, y: 0, vx: 0, vy: 0 };
    let frame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      dotMotion.clear();
      fieldDrift.x = 0;
      fieldDrift.y = 0;
      fieldDrift.vx = 0;
      fieldDrift.vy = 0;
    };

    const draw = () => {
      current.x += (target.x - current.x) * 0.055;
      current.y += (target.y - current.y) * 0.055;
      current.opacity += (target.opacity - current.opacity) * 0.1;
      current.vx += (target.vx - current.vx) * 0.18;
      current.vy += (target.vy - current.vy) * 0.18;
      target.vx *= 0.82;
      target.vy *= 0.82;
      fieldDrift.vx += -fieldDrift.x * 0.018;
      fieldDrift.vy += -fieldDrift.y * 0.018;
      fieldDrift.vx *= 0.92;
      fieldDrift.vy *= 0.92;
      fieldDrift.x = Math.max(-64, Math.min(64, fieldDrift.x + fieldDrift.vx));
      fieldDrift.y = Math.max(-64, Math.min(64, fieldDrift.y + fieldDrift.vy));
      if (scrollWave.active) {
        scrollWave.front += 11.5;
        scrollWave.strength *= 0.992;
        if (scrollWave.front > radius + 38 || scrollWave.strength < 0.025) {
          scrollWave.active = false;
        }
      }
      context.clearRect(0, 0, width, height);

      if (current.opacity > 0.002) {
        const fieldCenterX = current.x + fieldDrift.x;
        const fieldCenterY = current.y + fieldDrift.y;
        const fieldMargin = radius + 36;
        const startX = Math.max(0, Math.floor((current.x - fieldMargin) / spacing) * spacing);
        const endX = Math.min(width, Math.ceil((current.x + fieldMargin) / spacing) * spacing);
        const startY = Math.max(0, Math.floor((current.y - fieldMargin) / spacing) * spacing);
        const endY = Math.min(height, Math.ceil((current.y + fieldMargin) / spacing) * spacing);

        for (let y = startY; y <= endY; y += spacing) {
          for (let x = startX; x <= endX; x += spacing) {
            const fieldX = x + fieldDrift.x;
            const fieldY = y + fieldDrift.y;
            const distance = Math.hypot(fieldX - fieldCenterX, fieldY - fieldCenterY);
            if (distance >= radius) continue;

            const proximity = 1 - distance / radius;
            const eased = proximity * proximity * (3 - 2 * proximity);
            const key = `${x}:${y}`;
            const motion = dotMotion.get(key) ?? { dx: 0, dy: 0, vx: 0, vy: 0 };
            if (!dotMotion.has(key)) dotMotion.set(key, motion);

            const rawPointerSpeed = Math.hypot(current.vx, current.vy);
            const pointerSpeed = Math.min(rawPointerSpeed, 26) / 26;
            if (pointerSpeed > 0.012 && distance > 0.1) {
              const travelX = current.vx / rawPointerSpeed;
              const travelY = current.vy / rawPointerSpeed;
              const normalX = -travelY;
              const normalY = travelX;
              const along = (fieldX - fieldCenterX) * travelX + (fieldY - fieldCenterY) * travelY;
              const across = Math.abs((fieldX - fieldCenterX) * normalX + (fieldY - fieldCenterY) * normalY);
              const waveBand = Math.exp(-(along * along) / (2 * 24 * 24));
              const barEnvelope = Math.pow(Math.max(0, 1 - across / radius), 0.45);
              const dragGain = target.pressed ? 2.05 : 1;
              const impulse = waveBand * barEnvelope * eased * pointerSpeed * dragGain * 1.55;

              motion.vx += travelX * impulse;
              motion.vy += travelY * impulse;
            }

            if (scrollWave.active) {
              const waveNormalX = -scrollWave.uy;
              const waveNormalY = scrollWave.ux;
              const alongWave = (fieldX - fieldCenterX) * scrollWave.ux + (fieldY - fieldCenterY) * scrollWave.uy;
              const acrossWave = Math.abs((fieldX - fieldCenterX) * waveNormalX + (fieldY - fieldCenterY) * waveNormalY);
              const distanceToFront = alongWave - scrollWave.front;
              const waveBand = Math.exp(-(distanceToFront * distanceToFront) / (2 * 27 * 27));
              const barEnvelope = Math.pow(Math.max(0, 1 - acrossWave / radius), 0.4);
              const impulse = waveBand * barEnvelope * eased * scrollWave.strength * 0.72;

              motion.vx += scrollWave.ux * impulse;
              motion.vy += scrollWave.uy * impulse;
            }

            motion.vx += -motion.dx * 0.055;
            motion.vy += -motion.dy * 0.055;
            motion.vx *= 0.84;
            motion.vy *= 0.84;
            motion.dx = Math.max(-16, Math.min(16, motion.dx + motion.vx));
            motion.dy = Math.max(-16, Math.min(16, motion.dy + motion.vy));

            const dotRadius = 0.28 + eased * 2.45;
            const alpha = current.opacity * eased * 0.05;

            context.beginPath();
            context.arc(fieldX + motion.dx, fieldY + motion.dy, dotRadius, 0, Math.PI * 2);
            context.fillStyle = `rgba(32, 32, 30, ${alpha})`;
            context.fill();
          }
        }
      }

      frame = window.requestAnimationFrame(draw);
    };

    const move = (event: PointerEvent) => {
      const entering = target.opacity === 0;
      target.vx = entering ? 0 : Math.max(-32, Math.min(32, event.clientX - target.x));
      target.vy = entering ? 0 : Math.max(-32, Math.min(32, event.clientY - target.y));
      if (!entering) {
        fieldDrift.vx += target.vx * 0.025;
        fieldDrift.vy += target.vy * 0.025;
      }
      target.x = event.clientX;
      target.y = event.clientY;
      target.opacity = 1;
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      const hovered = document.elementFromPoint(event.clientX, event.clientY);
      cursor.dataset.interactive = hovered?.closest(INTERACTIVE_SELECTOR) ? "true" : "false";
      cursor.dataset.visible = "true";
    };

    const leave = () => {
      target.opacity = 0;
      target.vx = 0;
      target.vy = 0;
      cursor.dataset.visible = "false";
    };

    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 1) return;
      const direction = Math.sign(event.deltaY);
      const strength = Math.min(1.45, 0.72 + Math.abs(event.deltaY) / 180);

      if (!scrollWave.active || scrollWave.uy !== direction || scrollWave.front > radius * 0.68) {
        scrollWave.active = true;
        scrollWave.ux = 0;
        scrollWave.uy = direction;
        scrollWave.front = -radius - 22;
        scrollWave.strength = strength;
      } else {
        scrollWave.strength = Math.min(1.65, scrollWave.strength + strength * 0.16);
      }
      fieldDrift.vy += direction * Math.min(9.2, 3.4 + Math.abs(event.deltaY) * 0.038);
      target.opacity = 1;
    };

    const down = () => {
      target.pressed = true;
      cursor.dataset.pressed = "true";
    };
    const up = () => {
      target.pressed = false;
      cursor.dataset.pressed = "false";
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("wheel", wheel, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    window.addEventListener("blur", leave);
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("wheel", wheel);
      document.documentElement.removeEventListener("mouseleave", leave);
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

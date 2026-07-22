"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = "a, button, [role='button']";

export default function PointerField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cursor = cursorRef.current;
    const media = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!canvas || !cursor || !media.matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    document.documentElement.classList.add("pointer-system-active");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2, opacity: 0 };
    const current = { ...target };
    const spacing = 18;
    const radius = 220;
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
    };

    const draw = () => {
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      current.opacity += (target.opacity - current.opacity) * 0.1;
      context.clearRect(0, 0, width, height);

      if (current.opacity > 0.002) {
        const startX = Math.max(0, Math.floor((current.x - radius) / spacing) * spacing);
        const endX = Math.min(width, Math.ceil((current.x + radius) / spacing) * spacing);
        const startY = Math.max(0, Math.floor((current.y - radius) / spacing) * spacing);
        const endY = Math.min(height, Math.ceil((current.y + radius) / spacing) * spacing);

        for (let y = startY; y <= endY; y += spacing) {
          for (let x = startX; x <= endX; x += spacing) {
            const distance = Math.hypot(x - current.x, y - current.y);
            if (distance >= radius) continue;

            const proximity = 1 - distance / radius;
            const eased = proximity * proximity * (3 - 2 * proximity);
            const dotRadius = 0.28 + eased * 2.45;
            const alpha = current.opacity * eased * 0.48;

            context.beginPath();
            context.arc(x, y, dotRadius, 0, Math.PI * 2);
            context.fillStyle = `rgba(32, 32, 30, ${alpha})`;
            context.fill();
          }
        }
      }

      frame = window.requestAnimationFrame(draw);
    };

    const move = (event: PointerEvent) => {
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
      cursor.dataset.visible = "false";
    };

    const down = () => { cursor.dataset.pressed = "true"; };
    const up = () => { cursor.dataset.pressed = "false"; };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    window.addEventListener("blur", leave);
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
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

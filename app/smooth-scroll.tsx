"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { registerFrameTask, requestSharedFrame } from "./frame-loop";

type SmoothScrollProps = {
  paused: boolean;
};

export default function SmoothScroll({ paused }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      anchors: {
        offset: -96,
      },
      stopInertiaOnNavigate: true,
    });

    lenisRef.current = lenis;
    const wake = () => requestSharedFrame();
    const unregisterFrame = registerFrameTask((time) => {
      lenis.raf(time);
      if (pausedRef.current) return false;
      return (
        Math.abs(lenis.targetScroll - lenis.animatedScroll) > 0.1 ||
        Math.abs(lenis.velocity) > 0.01
      );
    });

    window.addEventListener("wheel", wake, { passive: true });
    window.addEventListener("touchmove", wake, { passive: true });
    window.addEventListener("pointerdown", wake, { passive: true });
    window.addEventListener("scroll", wake, { passive: true });
    document.addEventListener("click", wake, true);

    return () => {
      unregisterFrame();
      window.removeEventListener("wheel", wake);
      window.removeEventListener("touchmove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("scroll", wake);
      document.removeEventListener("click", wake, true);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (paused) {
      lenis.stop();
    } else {
      lenis.start();
      requestSharedFrame();
    }
  }, [paused]);

  return null;
}

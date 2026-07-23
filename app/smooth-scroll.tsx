"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

type SmoothScrollProps = {
  paused: boolean;
};

export default function SmoothScroll({ paused }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      anchors: {
        offset: -96,
      },
      stopInertiaOnNavigate: true,
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (paused) lenis.stop();
    else lenis.start();
  }, [paused]);

  return null;
}

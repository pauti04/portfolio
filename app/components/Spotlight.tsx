"use client";

import { useEffect } from "react";

/**
 * Cursor-following spotlight on every .glass card.
 * Updates --mx / --my CSS vars on the element under the cursor.
 * One global pointer listener — no per-card React state.
 */
export default function Spotlight() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTarget: HTMLElement | null = null;

    const apply = () => {
      rafId = 0;
      if (!lastTarget) return;
      const r = lastTarget.getBoundingClientRect();
      lastTarget.style.setProperty("--mx", `${lastX - r.left}px`);
      lastTarget.style.setProperty("--my", `${lastY - r.top}px`);
    };

    const onMove = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest(".glass") as HTMLElement | null;
      lastX = e.clientX;
      lastY = e.clientY;
      lastTarget = t;
      if (!rafId) rafId = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}

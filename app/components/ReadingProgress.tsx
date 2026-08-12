"use client";

import { useEffect, useRef } from "react";

export default function ReadingProgress() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const el = fillRef.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.transform = `scaleX(${progress})`;
    };

    const schedule = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(update);
      }
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 pointer-events-none"
      style={{ height: "2px", background: "transparent" }}
      aria-hidden="true"
    >
      <div
        ref={fillRef}
        style={{
          height: "100%",
          background: "var(--color-accent)",
          transform: "scaleX(0)",
          transformOrigin: "left",
          boxShadow: "0 0 8px var(--color-accent)",
        }}
      />
    </div>
  );
}

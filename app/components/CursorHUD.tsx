"use client";

import { useEffect, useRef, useState } from "react";

// Instrument-panel cursor readout: x/y in px, scroll depth in %.
// Desktop pointer devices only; hidden under reduced motion.
export default function CursorHUD() {
  const [on, setOn] = useState(false);
  const xRef = useRef<HTMLSpanElement>(null);
  const yRef = useRef<HTMLSpanElement>(null);
  const sRef = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return;
    setOn(true);

    let mx = 0, my = 0;
    const paint = () => {
      raf.current = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      if (xRef.current) xRef.current.textContent = String(mx).padStart(4, "0");
      if (yRef.current) yRef.current.textContent = String(my).padStart(4, "0");
      if (sRef.current) sRef.current.textContent = String(pct).padStart(3, "0");
    };
    const queue = () => { if (!raf.current) raf.current = requestAnimationFrame(paint); };
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; queue(); };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", queue);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (!on) return null;

  return (
    <div
      aria-hidden
      className="fixed bottom-4 right-5 z-40 pointer-events-none mono text-[0.6rem] tracking-[0.14em] text-[var(--color-muted)] flex items-center gap-3 border border-[var(--color-line)] bg-[var(--color-bg)]/80 px-2.5 py-1 rounded-[4px]"
    >
      <span>
        x <span ref={xRef} className="text-[var(--color-fg-soft)] tabular-nums">0000</span>
      </span>
      <span>
        y <span ref={yRef} className="text-[var(--color-fg-soft)] tabular-nums">0000</span>
      </span>
      <span>
        scroll <span ref={sRef} className="text-[var(--color-amber)] tabular-nums">000</span>%
      </span>
    </div>
  );
}

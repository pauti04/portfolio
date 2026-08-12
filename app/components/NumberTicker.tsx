"use client";

import { useEffect, useRef, useState } from "react";

const NUM_RE = /^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/;
const DURATION = 900;

export default function NumberTicker({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const match = value.match(NUM_RE);
  const prefix = match ? match[1] : "";
  const numeric = match ? match[2] : "";
  const suffix = match ? match[3] : "";
  const target = numeric ? parseFloat(numeric) : 0;
  const decimals = numeric.includes(".") ? numeric.split(".")[1].length : 0;

  const ref = useRef<HTMLDivElement>(null);
  // Start at the final value so no-JS, reduced-motion, and hydration all
  // show the real number; the observer rewinds to 0 and animates up once.
  const [display, setDisplay] = useState(numeric);

  useEffect(() => {
    if (!numeric) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || e.intersectionRatio < 0.5) continue;
          io.disconnect();
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / DURATION, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay((target * eased).toFixed(decimals));
            if (t < 1) raf = requestAnimationFrame(tick);
          };
          setDisplay((0).toFixed(decimals));
          raf = requestAnimationFrame(tick);
          return;
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [numeric, target, decimals]);

  if (!numeric) {
    return <div className={className}>{value}</div>;
  }

  return (
    <div ref={ref} className={className}>
      {prefix}
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{display}</span>
      {suffix}
    </div>
  );
}

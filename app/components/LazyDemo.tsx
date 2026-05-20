"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function LazyDemo({
  label,
  height = 320,
  children,
}: {
  label: string;
  height?: number;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      role="figure"
      aria-label={label}
      style={!visible ? { minHeight: height } : undefined}
    >
      {visible ? (
        children
      ) : (
        <div
          aria-hidden
          className="rounded-[14px] border border-[var(--color-line)] bg-gradient-to-b from-[#131418] to-[#0d0d10] flex items-center justify-center"
          style={{ minHeight: height }}
        >
          <span className="mono text-[0.74rem] text-[var(--color-muted)] uppercase tracking-[0.2em] flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
              style={{ animation: "pulse-ring 1.6s ease-out infinite" }}
            />
            Loading {label}…
          </span>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export default function MarginNote({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`text-[0.66em] mx-[1px] tabular-nums align-super focus:outline-none transition ${
          open
            ? "text-[var(--color-bg)] bg-[var(--color-accent)] px-[3px] rounded-sm"
            : "text-[var(--color-accent)] hover:underline"
        }`}
        aria-expanded={open}
      >
        {n}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-30 left-1/2 -translate-x-1/2 mt-2 top-full w-[280px] p-3.5 text-[0.84rem] leading-[1.55] text-[var(--color-fg)] bg-[var(--color-bg)] border border-[var(--color-line)] rounded-lg shadow-[0_18px_40px_-18px_rgba(31,30,28,0.28)]"
          style={{ animation: "fade-in 0.18s ease-out both" }}
        >
          <span className="block text-[0.6rem] uppercase tracking-[0.18em] text-[var(--color-accent)] mb-1.5">
            Note {n}
          </span>
          <span className="italic text-[var(--color-fg-soft)]">{children}</span>
          <span
            className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-bg)] border-t border-l border-[var(--color-line)] rotate-45"
            aria-hidden
          />
        </span>
      )}
    </span>
  );
}

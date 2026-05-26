"use client";

import { useEffect } from "react";

/**
 * Adds .reveal to every <section> below the fold, then .revealed
 * when it scrolls into view. Skips #cover (already animates on load).
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = Array.from(
      document.querySelectorAll("section")
    ).filter((el) => el.id !== "cover");

    targets.forEach((el) => el.classList.add("reveal"));

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((t) => {
      // If already in view on mount (above the fold), reveal immediately.
      const r = t.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) {
        t.classList.add("revealed");
      } else {
        io.observe(t);
      }
    });

    return () => io.disconnect();
  }, []);

  return null;
}

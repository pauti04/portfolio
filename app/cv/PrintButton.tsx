"use client";

import { useEffect } from "react";

export default function PrintButton() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") === "1") {
      setTimeout(() => window.print(), 250);
    }
  }, []);

  return (
    <div className="no-print fixed top-4 right-4 z-50 flex items-center gap-2">
      <a
        href="/"
        className="text-[0.78rem] text-[#444] hover:text-[#111] bg-white border border-[#ddd] rounded-md px-3 py-1.5 shadow-sm"
      >
        ← Back
      </a>
      <button
        onClick={() => window.print()}
        className="text-[0.78rem] text-white bg-[#111] hover:bg-[#333] rounded-md px-3 py-1.5 shadow-sm font-medium"
      >
        Save as PDF
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";

type Claim = { id: number; text: string; score: number };

const SAMPLES: { label: string; threshold: number; claims: Claim[] }[] = [
  {
    label: "pr #142",
    threshold: 0.8,
    claims: [
      { id: 1, text: '"refactor cache eviction"', score: 0.04 },
      { id: 2, text: '"adds rate limiting to /v2/predict"', score: 0.91 },
      { id: 3, text: '"bumps tokio to 1.40"', score: 0.07 },
    ],
  },
  {
    label: "pr #189",
    threshold: 0.8,
    claims: [
      { id: 1, text: '"adds retry logic to outbound webhook"', score: 0.12 },
      { id: 2, text: '"fixes off-by-one in pagination"', score: 0.18 },
      { id: 3, text: '"closes #284"', score: 0.05 },
    ],
  },
  {
    label: "pr #207",
    threshold: 0.8,
    claims: [
      { id: 1, text: '"adds observability across services"', score: 0.76 },
      { id: 2, text: '"removes deprecated `legacy_auth` flag"', score: 0.09 },
      { id: 3, text: '"updates docs"', score: 0.62 },
    ],
  },
];

type RunState = "idle" | "running" | "done";

export default function ChainCheckActionDemo() {
  const [pick, setPick] = useState(0);
  const [threshold, setThreshold] = useState(0.8);
  const [state, setState] = useState<RunState>("idle");
  const [visible, setVisible] = useState<number>(0);

  const sample = SAMPLES[pick];

  const run = async () => {
    setState("running");
    setVisible(0);
    for (let i = 0; i < sample.claims.length; i++) {
      await new Promise((r) => setTimeout(r, 520));
      setVisible(i + 1);
    }
    await new Promise((r) => setTimeout(r, 320));
    setState("done");
  };

  const failed = sample.claims.filter((c) => c.score >= threshold).length;

  return (
    <div className="artifact !p-0 overflow-hidden" style={{ fontSize: "0.7rem" }}>
      <header className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-line)] flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="c-accent">●</span>
          <span className="c-fg uppercase tracking-[0.18em] text-[0.66rem]">
            chaincheck-action
          </span>
          <span className="c-muted">·</span>
          <span className="c-muted text-[0.62rem]">.github/workflows/pr-check.yml</span>
        </div>
        <div className="flex items-center gap-1">
          {SAMPLES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => {
                setPick(i);
                setState("idle");
                setVisible(0);
              }}
              className={`mono text-[0.6rem] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-[3px] border transition ${
                pick === i
                  ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-3 py-2.5 mono text-[0.7rem]">
        <div className="c-muted text-[0.6rem] uppercase tracking-[0.16em] mb-1">
          step
        </div>
        <pre className="text-[var(--color-fg-soft)] whitespace-pre">
          <span className="c-muted">- uses: </span>
          <span className="c-fg">pauti04/chaincheck-action@v1</span>
          {"\n"}
          <span className="c-muted">  with:</span>
          {"\n"}
          <span className="c-muted">    fail-threshold: </span>
          <span className="c-accent">{threshold.toFixed(2)}</span>
        </pre>
      </div>

      <div className="px-3 py-2 flex items-center gap-3 border-y border-[var(--color-line)] flex-wrap">
        <span className="c-muted text-[0.6rem] uppercase tracking-[0.16em]">
          threshold
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="flex-1 accent-[var(--color-accent)] max-w-[200px]"
        />
        <span className="mono text-[0.66rem] c-fg tabular-nums">
          {threshold.toFixed(2)}
        </span>
        <button
          onClick={run}
          disabled={state === "running"}
          className="mono text-[0.62rem] uppercase tracking-[0.14em] px-2 py-0.5 rounded-[3px] border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-40 transition ml-auto"
        >
          {state === "running" ? "running…" : "▶ run check"}
        </button>
      </div>

      <div className="px-3 py-2.5 space-y-1.5 min-h-[110px]">
        <div className="c-muted text-[0.6rem] uppercase tracking-[0.16em]">
          ── claims
        </div>
        {sample.claims.map((c, i) => {
          const shown = i < visible;
          const bad = c.score >= threshold;
          return (
            <div
              key={c.id}
              className={`grid grid-cols-[16px_1fr_auto] items-center gap-2 mono text-[0.66rem] transition-opacity ${
                shown ? "opacity-100" : "opacity-25"
              }`}
            >
              <span className={bad ? "c-rose" : "c-emerald"}>
                {shown ? (bad ? "✗" : "✓") : "·"}
              </span>
              <span className="text-[var(--color-fg-soft)] truncate">{c.text}</span>
              <span className={`tabular-nums ${bad ? "c-rose" : "c-muted"}`}>
                {shown ? c.score.toFixed(2) : "—"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-[var(--color-line)] flex items-center gap-3">
        <span className="c-muted text-[0.6rem] uppercase tracking-[0.16em]">
          exit
        </span>
        {state === "done" ? (
          failed > 0 ? (
            <span className="mono text-[0.72rem] c-rose">
              exit 1 · {failed} claim{failed > 1 ? "s" : ""} above threshold · blocking merge
            </span>
          ) : (
            <span className="mono text-[0.72rem] c-emerald">
              exit 0 · all claims supported
            </span>
          )
        ) : (
          <span className="mono text-[0.72rem] c-muted">
            press <span className="c-fg">▶ run check</span> to simulate the action
          </span>
        )}
      </div>
    </div>
  );
}

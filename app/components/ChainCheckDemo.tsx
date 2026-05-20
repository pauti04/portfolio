"use client";

import { useState } from "react";

type DetectorState =
  | { status: "idle" }
  | { status: "thinking" }
  | { status: "done"; label: string; score: number; bad: boolean };

type Preset = {
  label: string;
  claim: string;
  source: string;
  expect: "halluc" | "ok" | "partial";
};

const PRESETS: Preset[] = [
  {
    label: "pr #142 · ✗",
    claim: "This PR adds rate limiting to /v2/predict",
    source:
      "app/v2/predict.py\n+ result = await model.run(req)\n+ log.info(\"predicted\", req_id=req.id)\n+ return result",
    expect: "halluc",
  },
  {
    label: "pr #143 · ✓",
    claim: "Bumps tokio to 1.40 and runs cargo update",
    source:
      "Cargo.toml\n- tokio = \"1.39\"\n+ tokio = \"1.40\"\nCargo.lock (regenerated, 217 lines)",
    expect: "ok",
  },
  {
    label: "llm answer · ⚠",
    claim:
      "The Eiffel Tower was built in 1889 by Gustave Eiffel for the 1900 World's Fair.",
    source:
      "Wikipedia: Eiffel Tower was constructed from 1887 to 1889 for the 1889 World's Fair (Exposition Universelle), commemorating the centennial of the French Revolution.",
    expect: "partial",
  },
];

const DETECTORS = [
  { id: "nli", name: "nli entailment" },
  { id: "judge", name: "llm-as-judge" },
  { id: "consistency", name: "self-consistency" },
  { id: "logprob", name: "token logprobs" },
  { id: "qa", name: "qa cross-check" },
] as const;

type Results = Record<string, DetectorState>;

const initial: Results = Object.fromEntries(
  DETECTORS.map((d) => [d.id, { status: "idle" } as DetectorState])
);

function rollFor(
  expect: Preset["expect"],
  id: string
): { label: string; score: number; bad: boolean } {
  if (expect === "halluc") {
    const map: Record<string, [string, number]> = {
      nli: ["contradicts", 0.94],
      judge: ["disagrees", 0.91],
      consistency: ["5/5 disagree", 1.0],
      logprob: ["2.1σ anomaly", 0.83],
      qa: ["no support", 0.88],
    };
    const [l, s] = map[id];
    return { label: l, score: s, bad: true };
  }
  if (expect === "ok") {
    const map: Record<string, [string, number]> = {
      nli: ["entails", 0.04],
      judge: ["agrees", 0.06],
      consistency: ["5/5 agree", 0.0],
      logprob: ["nominal", 0.09],
      qa: ["supported", 0.07],
    };
    const [l, s] = map[id];
    return { label: l, score: s, bad: false };
  }
  const map: Record<string, [string, number, boolean]> = {
    nli: ["mixed", 0.52, false],
    judge: ["partial", 0.61, true],
    consistency: ["3/5 agree", 0.4, false],
    logprob: ["1.1σ", 0.47, false],
    qa: ["dated 1889 ≠ 1900", 0.78, true],
  };
  const [l, s, b] = map[id];
  return { label: l, score: s, bad: b };
}

export default function ChainCheckDemo() {
  const [active, setActive] = useState<Preset>(PRESETS[0]);
  const [results, setResults] = useState<Results>(initial);
  const [running, setRunning] = useState(false);

  const reset = () => {
    setResults(initial);
  };

  const run = async () => {
    if (running) return;
    setRunning(true);
    setResults({ ...initial });
    for (const d of DETECTORS) {
      setResults((r) => ({ ...r, [d.id]: { status: "thinking" } }));
      await new Promise((r) => setTimeout(r, 320 + Math.random() * 220));
      const roll = rollFor(active.expect, d.id);
      setResults((r) => ({
        ...r,
        [d.id]: { status: "done", ...roll },
      }));
    }
    setRunning(false);
  };

  const pick = (p: Preset) => {
    setActive(p);
    reset();
  };

  const done = DETECTORS.every((d) => results[d.id].status === "done");
  const badCount = done
    ? DETECTORS.filter((d) => {
        const r = results[d.id];
        return r.status === "done" && r.bad;
      }).length
    : 0;

  const verdict = done
    ? badCount >= 4
      ? { color: "rose", text: "✗ hallucination", conf: 0.91 }
      : badCount === 0
      ? { color: "emerald", text: "✓ supported", conf: 0.05 }
      : { color: "accent", text: "⚠ partial", conf: 0.62 }
    : null;

  return (
    <div className="artifact !p-0 overflow-hidden" style={{ fontSize: "0.7rem" }}>
      <header className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-line)]">
        <div className="flex items-center gap-3">
          <span className="c-accent">●</span>
          <span className="c-fg uppercase tracking-[0.18em] text-[0.66rem]">
            chaincheck
          </span>
          <span className="c-muted">·</span>
          <span className="c-muted text-[0.62rem]">5 detectors · ensemble</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => pick(p)}
              className={`mono text-[0.6rem] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-[3px] border transition ${
                active.label === p.label
                  ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="border-b md:border-b-0 md:border-r border-[var(--color-line)]">
          <div className="px-3 py-1.5 c-muted uppercase tracking-[0.16em] text-[0.6rem] border-b border-[var(--color-line)]">
            claim
          </div>
          <div className="px-3 py-2 mono text-[0.7rem] text-[var(--color-fg)] min-h-[60px]">
            {active.claim}
          </div>
          <div className="px-3 py-1.5 c-muted uppercase tracking-[0.16em] text-[0.6rem] border-y border-[var(--color-line)]">
            source · ground truth
          </div>
          <div className="px-3 py-2 mono text-[0.66rem] text-[var(--color-fg-soft)] whitespace-pre-wrap">
            {active.source}
          </div>
        </div>

        <div>
          <div className="px-3 py-1.5 c-muted uppercase tracking-[0.16em] text-[0.6rem] border-b border-[var(--color-line)] flex items-center justify-between">
            <span>detectors</span>
            <button
              onClick={run}
              disabled={running}
              className="mono text-[0.62rem] uppercase tracking-[0.14em] px-2 py-0.5 rounded-[3px] border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-40 transition"
            >
              {running ? "running…" : "▶ run"}
            </button>
          </div>
          <ul className="px-3 py-2.5 space-y-1.5">
            {DETECTORS.map((d) => (
              <DetectorRow key={d.id} name={d.name} state={results[d.id]} />
            ))}
          </ul>
        </div>
      </div>

      <div className="px-3 py-2 border-t border-[var(--color-line)] flex items-center gap-3 flex-wrap">
        <span className="c-muted text-[0.62rem] uppercase tracking-[0.16em]">
          verdict
        </span>
        {verdict ? (
          <span className="mono text-[0.72rem]">
            <span className={`c-${verdict.color}`}>{verdict.text}</span>
            <span className="c-muted"> · confidence </span>
            <span className="c-accent">{verdict.conf.toFixed(2)}</span>
          </span>
        ) : (
          <span className="mono text-[0.72rem] c-muted">
            press <span className="c-fg">▶ run</span> to ensemble the detectors
          </span>
        )}
      </div>
    </div>
  );
}

function DetectorRow({ name, state }: { name: string; state: DetectorState }) {
  return (
    <li className="grid grid-cols-[110px_1fr_auto] items-center gap-2 mono text-[0.66rem]">
      <span className="c-muted lowercase">{name}</span>
      {state.status === "idle" && (
        <>
          <span className="h-[3px] bg-[var(--color-line)] rounded-full" />
          <span className="c-muted">—</span>
        </>
      )}
      {state.status === "thinking" && (
        <>
          <span className="h-[3px] bg-[var(--color-line)] rounded-full overflow-hidden relative">
            <span
              className="absolute inset-y-0 left-0 w-1/3 bg-[var(--color-accent)] rounded-full"
              style={{ animation: "shimmer 0.9s linear infinite" }}
            />
          </span>
          <span className="c-accent">…</span>
        </>
      )}
      {state.status === "done" && (
        <>
          <span className="h-[3px] bg-[var(--color-line)] rounded-full overflow-hidden">
            <span
              className="block h-full rounded-full"
              style={{
                width: `${Math.max(4, state.score * 100)}%`,
                background: state.bad
                  ? "var(--color-rose)"
                  : "var(--color-emerald)",
              }}
            />
          </span>
          <span className={state.bad ? "c-rose" : "c-emerald"}>
            {state.label} {state.score.toFixed(2)}
          </span>
        </>
      )}
    </li>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "replay" | "diff" | "promote";
type RunState = "idle" | "running" | "done";

const EVENTS = [
  { seq: 1, kind: "llm_call", text: 'assistant → "refund order #8841, $129.99"', tone: "fg" },
  { seq: 2, kind: "tool_call", text: 'refund(amount="129.99")', note: "str — schema wants float", tone: "rose" },
  { seq: 3, kind: "tool_err", text: "TypeError: amount must be a number", tone: "rose" },
  { seq: 4, kind: "tool_call", text: 'refund(amount="129.99")', note: "identical retry", tone: "rose" },
  { seq: 5, kind: "tool_err", text: "TypeError: amount must be a number", tone: "rose" },
  { seq: 6, kind: "classify", text: "wrong_tool_args · loop", tone: "accent" },
];

const DIFF = [
  { seq: 1, a: 'llm_call  "population of Tokyo?"', b: 'llm_call  "population of Tokyo?"', diverge: false },
  { seq: 2, a: "llm → tool_use: search", b: "llm → tool_use: search", diverge: false },
  { seq: 3, a: 'search(query="tokyo population")', b: 'search(q="tokyo population")', diverge: true },
  { seq: 4, a: "result: 37.4M · task done ✓", b: "KeyError: 'query' · crash ✗", diverge: true },
];

const PROMOTE_YAML = [
  { text: "# agent_tests/support-run-19.yaml", tone: "muted" },
  { text: "task: refund order #8841", tone: "fg" },
  { text: "replay_from: runs/support-run-19", tone: "fg" },
  { text: "assertions:", tone: "fg" },
  { text: "  - tool_args_match_schema: refund", tone: "accent" },
  { text: "  - no_repeated_identical_calls: 2", tone: "accent" },
  { text: "  - final_status: success", tone: "accent" },
];

export default function ReflightDemo() {
  const [mode, setMode] = useState<Mode>("replay");
  const [state, setState] = useState<RunState>("idle");
  const [visible, setVisible] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const userTouchedRef = useRef(false);
  const autoFiredRef = useRef(false);
  const stateRef = useRef<RunState>(state);
  const runRef = useRef<() => void>(() => {});

  const rows =
    mode === "replay" ? EVENTS.length : mode === "diff" ? DIFF.length : PROMOTE_YAML.length;

  const run = async () => {
    setState("running");
    setVisible(0);
    for (let i = 0; i < rows; i++) {
      await new Promise((r) => setTimeout(r, mode === "promote" ? 180 : 420));
      if (!mountedRef.current) return;
      setVisible(i + 1);
    }
    if (!mountedRef.current) return;
    setState("done");
  };

  useEffect(() => {
    stateRef.current = state;
    runRef.current = run;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || autoFiredRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio < 0.4) continue;
          io.disconnect();
          if (autoFiredRef.current || userTouchedRef.current || stateRef.current !== "idle") {
            return;
          }
          autoFiredRef.current = true;
          timer = setTimeout(() => {
            if (mountedRef.current && !userTouchedRef.current && stateRef.current === "idle") {
              runRef.current();
            }
          }, 500);
          return;
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer !== undefined) clearTimeout(timer);
    };
  }, []);

  const pick = (m: Mode) => {
    userTouchedRef.current = true;
    setMode(m);
    setState("idle");
    setVisible(0);
  };

  const cmd =
    mode === "replay"
      ? "reflight replay support-run-19 --step"
      : mode === "diff"
      ? "reflight diff research-ok research-fail"
      : "reflight promote support-run-19";

  return (
    <div ref={rootRef} className="artifact !p-0 overflow-hidden" style={{ fontSize: "0.7rem" }}>
      <header className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-line)] flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="c-accent">⏺</span>
          <span className="c-fg uppercase tracking-[0.18em] text-[0.66rem]">reflight</span>
          <span className="c-muted">·</span>
          <span className="c-muted text-[0.62rem]">recorded runs, network off</span>
        </div>
        <div className="flex items-center gap-1">
          {(["replay", "diff", "promote"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => pick(m)}
              className={`mono text-[0.6rem] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-[3px] border transition ${
                mode === m
                  ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      <div className="px-3 py-2 flex items-center gap-3 border-b border-[var(--color-line)] flex-wrap">
        <span className="mono text-[0.68rem]">
          <span className="c-muted">$ </span>
          <span className="c-fg">{cmd}</span>
        </span>
        <button
          onClick={() => {
            userTouchedRef.current = true;
            run();
          }}
          disabled={state === "running"}
          className="mono text-[0.62rem] uppercase tracking-[0.14em] px-2 py-0.5 rounded-[3px] border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-40 transition ml-auto"
        >
          {state === "running" ? "replaying…" : "▶ run"}
        </button>
      </div>

      <div className="px-3 py-2.5 space-y-1.5 min-h-[132px] mono">
        {mode === "replay" &&
          EVENTS.map((e, i) => {
            const shown = i < visible;
            return (
              <div
                key={e.seq}
                className={`grid grid-cols-[34px_74px_1fr] items-baseline gap-2 text-[0.66rem] transition-opacity ${
                  shown ? "opacity-100" : "opacity-25"
                }`}
              >
                <span className="c-muted tabular-nums">{shown ? `s${String(e.seq).padStart(2, "0")}` : "·"}</span>
                <span className={e.kind === "classify" ? "c-accent" : "c-muted"}>{e.kind}</span>
                <span className={e.tone === "rose" ? "c-rose" : e.tone === "accent" ? "c-accent" : "text-[var(--color-fg-soft)]"}>
                  {e.text}
                  {e.note && shown && <span className="c-muted"> ← {e.note}</span>}
                </span>
              </div>
            );
          })}

        {mode === "diff" && (
          <>
            <div className="grid grid-cols-[28px_1fr_1fr] gap-2 text-[0.6rem] uppercase tracking-[0.14em] c-muted">
              <span>seq</span>
              <span>research-ok</span>
              <span>research-fail</span>
            </div>
            {DIFF.map((d, i) => {
              const shown = i < visible;
              const firstDivergence = d.diverge && DIFF.findIndex((x) => x.diverge) === i;
              return (
                <div
                  key={d.seq}
                  className={`grid grid-cols-[28px_1fr_1fr] gap-2 text-[0.64rem] transition-opacity ${
                    shown ? "opacity-100" : "opacity-25"
                  } ${firstDivergence && shown ? "bg-[var(--color-accent)]/10 -mx-1.5 px-1.5 py-0.5 rounded" : ""}`}
                >
                  <span className="c-muted tabular-nums">{String(d.seq).padStart(2, "0")}</span>
                  <span className={d.diverge ? "c-emerald" : "text-[var(--color-fg-soft)]"}>{d.a}</span>
                  <span className={d.diverge ? "c-rose" : "text-[var(--color-fg-soft)]"}>
                    {d.b}
                    {firstDivergence && shown && (
                      <span className="c-accent"> ← first divergence</span>
                    )}
                  </span>
                </div>
              );
            })}
          </>
        )}

        {mode === "promote" &&
          PROMOTE_YAML.map((l, i) => {
            const shown = i < visible;
            return (
              <div
                key={i}
                className={`text-[0.66rem] transition-opacity ${shown ? "opacity-100" : "opacity-25"}`}
              >
                <span className={l.tone === "muted" ? "c-muted" : l.tone === "accent" ? "c-accent" : "text-[var(--color-fg-soft)]"}>
                  {l.text}
                </span>
              </div>
            );
          })}
      </div>

      <div className="px-3 py-2 border-t border-[var(--color-line)] flex items-center gap-3">
        <span className="c-muted text-[0.6rem] uppercase tracking-[0.16em]">verdict</span>
        {state === "done" ? (
          mode === "replay" ? (
            <span className="mono text-[0.72rem]">
              <span className="c-rose">wrong_tool_args · loop</span>
              <span className="c-muted"> · replayed 6 events · 7 ms · $0.00</span>
            </span>
          ) : mode === "diff" ? (
            <span className="mono text-[0.72rem]">
              <span className="c-accent">diverged at seq 03</span>
              <span className="c-muted"> — passing run sent `query`, failing run sent `q`</span>
            </span>
          ) : (
            <span className="mono text-[0.72rem]">
              <span className="c-emerald">test written</span>
              <span className="c-muted"> · runs in pytest · replay passes cost $0.00 forever</span>
            </span>
          )
        ) : (
          <span className="mono text-[0.72rem] c-muted">
            press <span className="c-fg">▶ run</span> — this is a real recorded failure, replayed
          </span>
        )}
      </div>
    </div>
  );
}

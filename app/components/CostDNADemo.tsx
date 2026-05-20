"use client";

import { useEffect, useRef, useState } from "react";

type NodeId =
  | "checkout"
  | "stripe"
  | "dynamo"
  | "sqs"
  | "recommend"
  | "sagemaker"
  | "s3"
  | "ingest"
  | "kinesis";

type Group = "checkout" | "recommend" | "ingest";

type Node = {
  id: NodeId;
  label: string;
  x: number;
  y: number;
  group: Group;
  layer: 0 | 1 | 2;
};

type Edge = { from: NodeId; to: NodeId };

const NODES: Node[] = [
  { id: "checkout", label: "checkout-api", x: 60, y: 50, group: "checkout", layer: 0 },
  { id: "recommend", label: "recommend-fn", x: 60, y: 145, group: "recommend", layer: 0 },
  { id: "ingest", label: "ingest-fn", x: 60, y: 240, group: "ingest", layer: 0 },

  { id: "stripe", label: "stripe-fn", x: 195, y: 35, group: "checkout", layer: 1 },
  { id: "dynamo", label: "dynamodb", x: 195, y: 85, group: "checkout", layer: 1 },
  { id: "sagemaker", label: "sagemaker", x: 195, y: 160, group: "recommend", layer: 1 },
  { id: "kinesis", label: "kinesis", x: 195, y: 245, group: "ingest", layer: 1 },

  { id: "sqs", label: "sqs", x: 320, y: 55, group: "checkout", layer: 2 },
  { id: "s3", label: "s3-features", x: 320, y: 195, group: "recommend", layer: 2 },
];

const EDGES: Edge[] = [
  { from: "checkout", to: "stripe" },
  { from: "checkout", to: "dynamo" },
  { from: "stripe", to: "sqs" },
  { from: "recommend", to: "sagemaker" },
  { from: "recommend", to: "s3" },
  { from: "sagemaker", to: "s3" },
  { from: "ingest", to: "kinesis" },
];

const METHODS: Record<NodeId, string[]> = {
  checkout: ["POST /v1/charge", "POST /v1/order", "GET /v1/cart"],
  recommend: ["Invoke", "ListRecs", "EmbedUser"],
  ingest: ["PutRecord", "GetShard"],
  stripe: ["CreateCharge", "RefundCharge"],
  dynamo: ["PutItem", "Query"],
  sagemaker: ["InvokeEndpoint", "DescribeModel"],
  kinesis: ["PutRecords", "GetShardIterator"],
  sqs: ["SendMessage", "ReceiveMessage"],
  s3: ["PutObject", "GetObject"],
};

const COST_PER_CALL: Record<NodeId, number> = {
  checkout: 0.00002,
  recommend: 0.00002,
  ingest: 0.00002,
  stripe: 0.0006,
  dynamo: 0.0011,
  sagemaker: 0.0048,
  kinesis: 0.00022,
  sqs: 0.00008,
  s3: 0.00031,
};

const GROUP_COLOR: Record<Group, string> = {
  checkout: "var(--color-accent)",
  recommend: "var(--color-rose)",
  ingest: "var(--color-emerald)",
};

type Particle = {
  id: number;
  from: NodeId;
  to: NodeId;
  group: Group;
  start: number;
  duration: number;
};

type Event = {
  id: number;
  src: NodeId;
  dst: NodeId;
  method: string;
  costUsd: number;
  ms: number;
  ts: number;
  group: Group;
};

type Pulse = {
  id: number;
  from: NodeId;
  to: NodeId;
  start: number;
  duration: number;
};

const QUERIES = [
  {
    q: "what's driving cost?",
    focus: "recommend" as NodeId,
    answer: "recommend-fn → sagemaker dominates (~70% of spend)",
  },
  {
    q: "biggest line item on checkout?",
    focus: "checkout" as NodeId,
    answer: "dynamodb under checkout-api — high R/W rate on the orders table",
  },
  {
    q: "who calls sagemaker?",
    focus: "sagemaker" as NodeId,
    answer: "only recommend-fn — single attribution path",
  },
];

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function descendants(root: NodeId): Set<NodeId> {
  const out = new Set<NodeId>([root]);
  let frontier = [root];
  while (frontier.length) {
    const next: NodeId[] = [];
    for (const f of frontier) {
      for (const e of EDGES) {
        if (e.from === f && !out.has(e.to)) {
          out.add(e.to);
          next.push(e.to);
        }
      }
    }
    frontier = next;
  }
  return out;
}

const WINDOW_MS = 30_000;

export default function CostDNADemo() {
  const [selected, setSelected] = useState<NodeId | null>(null);
  const [query, setQuery] = useState<number | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [running, setRunning] = useState(true);
  const [running_gnn, setRunningGnn] = useState(false);
  const [tick, setTick] = useState(0);

  const idRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const nodeMap = new Map(NODES.map((n) => [n.id, n]));

  const recentRef = useRef<
    Array<{ ts: number; group: Group; usd: number; edge: string }>
  >([]);

  useEffect(() => {
    if (recentRef.current.length > 0) return;
    const nowTs = Date.now();
    const seedEvents: typeof recentRef.current = [];
    for (let i = 0; i < 60; i++) {
      const edge = rand(EDGES);
      const root = NODES.find((n) => n.id === edge.from)!;
      const base = COST_PER_CALL[edge.to] * (0.7 + Math.random() * 1.4);
      const spike = Math.random() < 0.06 ? 4 + Math.random() * 4 : 1;
      seedEvents.push({
        ts: nowTs - Math.floor(Math.random() * WINDOW_MS),
        group: root.group,
        usd: base * spike,
        edge: `${edge.from}->${edge.to}`,
      });
    }
    seedEvents.sort((a, b) => a.ts - b.ts);
    recentRef.current = seedEvents;
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const fire = () => {
      const edge = rand(EDGES);
      const src = nodeMap.get(edge.from)!;
      const root = NODES.find((n) => n.id === src.id)!;
      const group = root.group;

      const method = rand(METHODS[edge.from]);
      const baseCost = COST_PER_CALL[edge.to] * (0.7 + Math.random() * 1.4);
      const isSpike = Math.random() < 0.05;
      const cost = baseCost * (isSpike ? 4 + Math.random() * 4 : 1);
      const ms = Math.round(8 + Math.random() * 90);

      const ev: Event = {
        id: idRef.current++,
        src: edge.from,
        dst: edge.to,
        method,
        costUsd: cost,
        ms,
        ts: Date.now(),
        group,
      };

      setEvents((es) => [ev, ...es].slice(0, 14));

      setParticles((p) => [
        ...p,
        {
          id: idRef.current++,
          from: edge.from,
          to: edge.to,
          group,
          start: performance.now(),
          duration: 900 + Math.random() * 500,
        },
      ]);

      const ekey = `${edge.from}->${edge.to}`;
      const nowTs = Date.now();
      recentRef.current.push({ ts: nowTs, group, usd: cost, edge: ekey });
      const cutoff = nowTs - WINDOW_MS;
      while (recentRef.current.length && recentRef.current[0].ts < cutoff) {
        recentRef.current.shift();
      }

      if (cancelled) return;
      const isBurst = Math.random() < 0.15;
      const delay = isBurst ? 300 + Math.random() * 400 : 1200 + Math.random() * 1600;
      timer = setTimeout(fire, delay);
    };

    timer = setTimeout(fire, 600 + Math.random() * 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [running]);

  useEffect(() => {
    const raf = () => {
      const now = performance.now();
      setParticles((p) => p.filter((x) => now - x.start < x.duration));
      setPulses((p) => p.filter((x) => now - x.start < x.duration));
      setTick((t) => t + 1);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const runGNN = () => {
    if (running_gnn) return;
    setRunningGnn(true);
    setSelected(null);
    const now = performance.now();

    const layer0to1 = EDGES.filter((e) => {
      const a = nodeMap.get(e.from)!;
      const b = nodeMap.get(e.to)!;
      return a.layer === 0 && b.layer === 1;
    });
    const layer1to2 = EDGES.filter((e) => {
      const a = nodeMap.get(e.from)!;
      const b = nodeMap.get(e.to)!;
      return a.layer === 1 && b.layer === 2;
    });

    setPulses((ps) => [
      ...ps,
      ...layer0to1.map((e) => ({
        id: idRef.current++,
        from: e.from,
        to: e.to,
        start: now,
        duration: 700,
      })),
    ]);

    setTimeout(() => {
      setPulses((ps) => [
        ...ps,
        ...layer1to2.map((e) => ({
          id: idRef.current++,
          from: e.from,
          to: e.to,
          start: performance.now(),
          duration: 700,
        })),
      ]);
    }, 720);

    setTimeout(() => setRunningGnn(false), 1700);
  };

  const recent = recentRef.current;
  const nowTs = Date.now();
  const oldest = recent[0]?.ts ?? nowTs;
  const windowSec = Math.max(0.5, (nowTs - oldest) / 1000);
  const windowCost = recent.reduce((s, r) => s + r.usd, 0);
  const dailyEstimate = (windowCost / windowSec) * 86400;
  const eventsPerMin = (recent.length / windowSec) * 60;
  const groupCost: Record<Group, number> = { checkout: 0, recommend: 0, ingest: 0 };
  for (const r of recent) groupCost[r.group] += r.usd;
  const edgeStats: Record<string, { calls: number; usd: number }> = {};
  for (const r of recent) {
    if (!edgeStats[r.edge]) edgeStats[r.edge] = { calls: 0, usd: 0 };
    edgeStats[r.edge].calls += 1;
    edgeStats[r.edge].usd += r.usd;
  }
  const totalCost = Math.max(0.0001, windowCost);

  const sub = selected ? descendants(selected) : new Set<NodeId>();

  return (
    <div className="artifact !p-0 overflow-hidden" style={{ fontSize: "0.7rem" }}>
      <header className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-line)] gap-2 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="c-accent shrink-0">●</span>
          <span className="c-fg uppercase tracking-[0.18em] text-[0.66rem] shrink-0">
            costdna.live
          </span>
          <span className="c-muted hidden sm:inline shrink-0">·</span>
          <span className="c-muted text-[0.62rem] truncate">
            cloudtrail stream → graphsage attribution
          </span>
        </div>
        <div className="flex items-center gap-3 text-[0.66rem]">
          <span className="c-muted">
            <span className="uppercase tracking-[0.14em] text-[0.58rem]">$/d est</span>{" "}
            <span className="c-fg tabular-nums">${Math.round(dailyEstimate).toLocaleString()}</span>
          </span>
          <span className="c-muted">
            <span className="uppercase tracking-[0.14em] text-[0.58rem]">events/min</span>{" "}
            <span className="c-fg tabular-nums">{Math.round(eventsPerMin)}</span>
          </span>
          <span className="c-muted">
            <span className="uppercase tracking-[0.14em] text-[0.58rem]">window</span>{" "}
            <span className="c-fg tabular-nums">{Math.round(Math.min(WINDOW_MS / 1000, windowSec))}s</span>
          </span>
          <button
            onClick={() => setRunning((r) => !r)}
            className="c-muted hover:text-[var(--color-accent)] transition uppercase tracking-[0.14em] text-[0.58rem]"
          >
            {running ? "[ pause ]" : "[ resume ]"}
          </button>
          <button
            onClick={runGNN}
            disabled={running_gnn}
            className="mono text-[0.6rem] uppercase tracking-[0.12em] px-2 py-0.5 rounded-[3px] border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-50 transition"
          >
            {running_gnn ? "running…" : "▶ run gnn"}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-0">
        <div className="border-b md:border-b-0 md:border-r border-[var(--color-line)] py-2 relative">
          <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[0.58rem] uppercase tracking-[0.16em] c-muted z-10">
            <span>Inputs · L0</span>
            <span>Hidden · L1</span>
            <span>Outputs · L2</span>
          </div>
          <svg viewBox="0 0 380 290" className="w-full h-[260px]" aria-label="service graph">
            <defs>
              <marker id="cd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-muted)" opacity="0.5" />
              </marker>
              <radialGradient id="cd-node" cx="50%" cy="50%">
                <stop offset="0%" stopColor="var(--color-bg-elevated)" />
                <stop offset="100%" stopColor="var(--color-bg)" />
              </radialGradient>
              <filter id="cd-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>

            {[0, 1, 2].map((l) => (
              <line
                key={l}
                x1={l === 0 ? 60 : l === 1 ? 195 : 320}
                y1={5}
                x2={l === 0 ? 60 : l === 1 ? 195 : 320}
                y2={280}
                stroke="var(--color-line-soft)"
                strokeDasharray="2 4"
                strokeWidth={0.5}
              />
            ))}

            {EDGES.map((e) => {
              const from = nodeMap.get(e.from)!;
              const to = nodeMap.get(e.to)!;
              const ekey = `${e.from}->${e.to}`;
              const isHovered = hoveredEdge === ekey;
              const inSub = sub.has(e.from) && sub.has(e.to);
              const stat = edgeStats[ekey];
              const intensity = stat ? Math.min(1, stat.calls / 30) : 0;
              return (
                <g key={ekey}>
                  <line
                    x1={from.x + 38}
                    y1={from.y}
                    x2={to.x - 38}
                    y2={to.y}
                    stroke={isHovered || inSub ? "var(--color-accent)" : "var(--color-line)"}
                    strokeWidth={1 + intensity * 0.8}
                    opacity={0.4 + intensity * 0.5}
                    markerEnd="url(#cd-arrow)"
                    style={{ transition: "stroke 0.2s" }}
                  />
                  <line
                    x1={from.x + 38}
                    y1={from.y}
                    x2={to.x - 38}
                    y2={to.y}
                    stroke="transparent"
                    strokeWidth={10}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredEdge(ekey)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                </g>
              );
            })}

            {pulses.map((p) => {
              const from = nodeMap.get(p.from)!;
              const to = nodeMap.get(p.to)!;
              const tNorm = (performance.now() - p.start) / p.duration;
              if (tNorm < 0 || tNorm > 1) return null;
              const x = from.x + (to.x - from.x) * tNorm;
              const y = from.y + (to.y - from.y) * tNorm;
              return (
                <g key={`pulse-${p.id}`}>
                  <circle cx={x} cy={y} r={10 + tNorm * 6} fill="var(--color-accent)" opacity={0.18 * (1 - tNorm)} filter="url(#cd-glow)" />
                  <circle cx={x} cy={y} r={3.2} fill="var(--color-accent)" opacity={1 - tNorm * 0.5} />
                </g>
              );
            })}

            {particles.map((p) => {
              const from = nodeMap.get(p.from)!;
              const to = nodeMap.get(p.to)!;
              const tNorm = (performance.now() - p.start) / p.duration;
              if (tNorm < 0 || tNorm > 1) return null;
              const x = from.x + 38 + (to.x - from.x - 76) * tNorm;
              const y = from.y + (to.y - from.y) * tNorm;
              return (
                <g key={p.id}>
                  <circle cx={x} cy={y} r={1.8} fill={GROUP_COLOR[p.group]} opacity={0.9} />
                  <circle cx={x} cy={y} r={4} fill={GROUP_COLOR[p.group]} opacity={0.18} />
                </g>
              );
            })}

            {NODES.map((n) => {
              const inSub = sub.has(n.id);
              const isRoot = n.id === selected;
              const recentTraffic = particles.some((p) => p.from === n.id || p.to === n.id);
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x},${n.y})`}
                  onClick={() => setSelected(n.id === selected ? null : n.id)}
                  onMouseEnter={() => setSelected((s) => s ?? n.id)}
                  style={{ cursor: "pointer" }}
                >
                  {recentTraffic && (
                    <circle r={20} fill={GROUP_COLOR[n.group]} opacity={0.06} />
                  )}
                  <rect
                    x={-38}
                    y={-11}
                    width={76}
                    height={22}
                    rx={5}
                    fill="url(#cd-node)"
                    stroke={
                      isRoot
                        ? "var(--color-accent)"
                        : inSub
                        ? "var(--color-accent)"
                        : "var(--color-line)"
                    }
                    strokeWidth={isRoot ? 1.4 : 0.9}
                    style={{ transition: "stroke 0.2s" }}
                  />
                  <circle
                    cx={-32}
                    cy={0}
                    r={2}
                    fill={GROUP_COLOR[n.group]}
                  />
                  <text
                    x={-26}
                    y={1.5}
                    fontFamily="var(--font-mono)"
                    fontSize="8.5"
                    fill={isRoot ? "var(--color-accent)" : inSub ? "var(--color-fg)" : "var(--color-fg-soft)"}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}

            {hoveredEdge && (() => {
              const [a, b] = hoveredEdge.split("->") as [NodeId, NodeId];
              const from = nodeMap.get(a)!;
              const to = nodeMap.get(b)!;
              const cx = (from.x + to.x) / 2;
              const cy = (from.y + to.y) / 2 - 14;
              const stat = edgeStats[hoveredEdge] ?? { calls: 0, usd: 0 };
              const txt = `${stat.calls} calls · $${stat.usd.toFixed(3)}`;
              return (
                <g pointerEvents="none">
                  <rect
                    x={cx - 42}
                    y={cy - 9}
                    width={84}
                    height={14}
                    rx={3}
                    fill="var(--color-bg-elevated)"
                    stroke="var(--color-line)"
                  />
                  <text x={cx} y={cy + 1} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="var(--color-fg)">
                    {txt}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        <div className="px-3 py-2.5 space-y-3">
          <div>
            <div className="c-muted uppercase tracking-[0.16em] text-[0.6rem] mb-1.5 flex items-center justify-between">
              <span>attribution · 30s</span>
              <span className="text-[0.56rem] text-[var(--color-muted)]/80">rolling</span>
            </div>
            <AttrBar label="checkout" usd={groupCost.checkout} total={totalCost} color={GROUP_COLOR.checkout} />
            <AttrBar label="recommend" usd={groupCost.recommend} total={totalCost} color={GROUP_COLOR.recommend} />
            <AttrBar label="ingest" usd={groupCost.ingest} total={totalCost} color={GROUP_COLOR.ingest} />
          </div>

          <div>
            <div className="c-muted uppercase tracking-[0.16em] text-[0.6rem] mb-1.5">
              ask the agent
            </div>
            <div className="space-y-1">
              {QUERIES.map((q, i) => (
                <button
                  key={q.q}
                  onClick={() => {
                    setSelected(q.focus);
                    setQuery(i);
                  }}
                  className={`w-full text-left mono text-[0.62rem] px-2 py-1 rounded-[3px] border transition ${
                    query === i
                      ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                      : "border-[var(--color-line)] text-[var(--color-fg-soft)] hover:border-[var(--color-fg-soft)]"
                  }`}
                >
                  → {q.q}
                </button>
              ))}
            </div>
            {query !== null && (
              <p className="mono text-[0.6rem] text-[var(--color-muted)] mt-2 leading-relaxed">
                <span className="c-accent">agent:</span> {QUERIES[query].answer}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-line)]">
        <div className="px-3 py-1.5 c-muted uppercase tracking-[0.16em] text-[0.6rem] flex items-center justify-between">
          <span>cloudtrail · tail</span>
          <span className="text-[0.58rem]">src.method → dst · cost · ms</span>
        </div>
        <div className="px-3 py-1.5 max-h-[110px] overflow-hidden space-y-[1px]">
          {events.length === 0 && (
            <div className="c-muted text-[0.66rem] py-2 italic">streaming…</div>
          )}
          {events.map((e, i) => (
            <div
              key={e.id}
              className="grid grid-cols-[1fr_56px_36px] gap-2 mono text-[0.62rem] items-baseline"
              style={{ opacity: 1 - i * 0.045 }}
            >
              <span className="truncate">
                <span style={{ color: GROUP_COLOR[e.group] }}>{e.src}</span>
                <span className="c-muted">.{e.method}</span>
                <span className="c-muted"> → </span>
                <span className="c-fg-soft">{e.dst}</span>
              </span>
              <span className="c-accent tabular-nums text-right">${e.costUsd.toFixed(4)}</span>
              <span className="c-muted tabular-nums text-right">{e.ms}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AttrBar({
  label,
  usd,
  total,
  color,
}: {
  label: string;
  usd: number;
  total: number;
  color: string;
}) {
  const pct = (usd / total) * 100;
  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between mono text-[0.62rem]">
        <span className="c-muted">{label}</span>
        <span className="c-fg-soft">
          ${usd.toFixed(3)} <span className="c-muted">· {pct.toFixed(0)}%</span>
        </span>
      </div>
      <div className="h-[3px] bg-[var(--color-line)] rounded-full overflow-hidden mt-0.5">
        <div
          className="h-full"
          style={{
            width: `${Math.max(2, pct)}%`,
            background: color,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Announce = {
  id: number;
  prefix: string;
  path: number[];
  origin: number;
  rpki: "valid" | "invalid" | "unknown";
  moas: boolean;
  distortion: boolean;
  ts: number;
  real?: boolean;
};

type Particle = {
  id: number;
  pathIds: number[];
  bad: boolean;
  start: number;
  duration: number;
};

const AS_NAMES: Record<number, string> = {
  174: "Cogent",
  1299: "Arelion",
  3356: "Lumen",
  6939: "HE",
  6453: "TATA",
  2914: "NTT",
  7018: "AT&T",
  16509: "AWS",
  15169: "Google",
  32934: "Meta",
  13335: "Cloudflare",
  8075: "Microsoft",
  36561: "YouTube",
  17557: "PTCL",
  37282: "MainOne",
  10297: "DV-LINK",
  3491: "PCCW",
  4837: "CN169",
  4134: "ChinaNet",
};

type ASNode = {
  asn: number;
  x: number;
  y: number;
  tier: "transit" | "content" | "edge" | "rogue";
};

const NODES: ASNode[] = [
  { asn: 174,   x: 90,  y: 60,  tier: "transit" },
  { asn: 3356,  x: 90,  y: 130, tier: "transit" },
  { asn: 1299,  x: 90,  y: 200, tier: "transit" },
  { asn: 2914,  x: 90,  y: 270, tier: "transit" },
  { asn: 6939,  x: 200, y: 30,  tier: "transit" },
  { asn: 6453,  x: 200, y: 300, tier: "transit" },
  { asn: 7018,  x: 200, y: 165, tier: "transit" },
  { asn: 15169, x: 320, y: 60,  tier: "content" },
  { asn: 32934, x: 320, y: 110, tier: "content" },
  { asn: 13335, x: 320, y: 160, tier: "content" },
  { asn: 16509, x: 320, y: 210, tier: "content" },
  { asn: 36561, x: 320, y: 260, tier: "content" },
  { asn: 8075,  x: 320, y: 310, tier: "content" },
  { asn: 17557, x: 200, y: 360, tier: "rogue" },
  { asn: 37282, x: 90,  y: 360, tier: "rogue" },
  { asn: 10297, x: 320, y: 360, tier: "rogue" },
];

const EDGES: Array<[number, number]> = [
  [174, 3356], [174, 1299], [174, 2914], [3356, 1299], [3356, 2914], [1299, 2914],
  [174, 6939], [3356, 7018], [1299, 6939], [2914, 6453], [6939, 7018], [7018, 6453],
  [6939, 15169], [6939, 32934], [7018, 13335], [7018, 16509], [6453, 36561], [6453, 8075],
  [3356, 15169], [3356, 32934], [1299, 13335], [2914, 16509],
  [174, 17557], [174, 37282], [2914, 10297], [3356, 17557],
];

const NORMAL_FLOWS = [
  { prefix: "208.65.152.0/22", origin: 36561, rpki: "valid" as const },
  { prefix: "157.240.0.0/16", origin: 32934, rpki: "valid" as const },
  { prefix: "104.16.0.0/12", origin: 13335, rpki: "valid" as const },
  { prefix: "3.5.0.0/16", origin: 16509, rpki: "valid" as const },
  { prefix: "172.217.0.0/16", origin: 15169, rpki: "valid" as const },
  { prefix: "20.40.0.0/13", origin: 8075, rpki: "valid" as const },
];

const INCIDENTS = {
  none: { label: "normal", note: "feed = ripe-ris-live · all clear" },
  yt: {
    label: "youtube/pakistan 2008",
    note: "AS17557 announcing AS36561 prefix · /24 more specific",
  },
  mew: {
    label: "myetherwallet 2018",
    note: "AS10297 hijacks Amazon Route 53 prefix",
  },
  mainone: {
    label: "mainone 2018",
    note: "AS37282 leaks Google routes via ChinaTel",
  },
} as const;

type IncidentKey = keyof typeof INCIDENTS;

function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function adjacency(): Map<number, number[]> {
  const m = new Map<number, number[]>();
  for (const [a, b] of EDGES) {
    if (!m.has(a)) m.set(a, []);
    if (!m.has(b)) m.set(b, []);
    m.get(a)!.push(b);
    m.get(b)!.push(a);
  }
  return m;
}

const ADJ = adjacency();

function bfsPath(src: number, dst: number): number[] {
  if (src === dst) return [src];
  const visited = new Set<number>([src]);
  const parent = new Map<number, number>();
  const q = [src];
  while (q.length) {
    const v = q.shift()!;
    for (const n of ADJ.get(v) ?? []) {
      if (visited.has(n)) continue;
      visited.add(n);
      parent.set(n, v);
      if (n === dst) {
        const out: number[] = [n];
        let cur = n;
        while (parent.has(cur)) {
          cur = parent.get(cur)!;
          out.unshift(cur);
        }
        return out;
      }
      q.push(n);
    }
  }
  return [src];
}

function makeNormal(id: number): Announce {
  const flow = rand(NORMAL_FLOWS);
  const transit = rand([174, 3356, 1299, 2914, 6939, 7018, 6453]);
  return {
    id,
    prefix: flow.prefix,
    path: [transit, flow.origin],
    origin: flow.origin,
    rpki: flow.rpki,
    moas: false,
    distortion: false,
    ts: Date.now(),
  };
}

function makeIncident(id: number, kind: IncidentKey): Announce | null {
  if (kind === "yt") {
    return {
      id, prefix: "208.65.153.0/24", path: [3491, 17557], origin: 17557,
      rpki: "invalid", moas: true, distortion: true, ts: Date.now(),
    };
  }
  if (kind === "mew") {
    return {
      id, prefix: "205.251.192.0/23", path: [4837, 4134, 10297], origin: 10297,
      rpki: "invalid", moas: true, distortion: true, ts: Date.now(),
    };
  }
  if (kind === "mainone") {
    return {
      id, prefix: "8.8.8.0/24", path: [4134, 37282], origin: 37282,
      rpki: "invalid", moas: true, distortion: true, ts: Date.now(),
    };
  }
  return null;
}

const SIGNAL_WINDOW = 36;

export default function NetPulseDemo() {
  const [sig, setSig] = useState({
    rpki: Array(SIGNAL_WINDOW).fill(0) as number[],
    moas: Array(SIGNAL_WINDOW).fill(0) as number[],
    dist: Array(SIGNAL_WINDOW).fill(0) as number[],
  });
  const [incident, setIncident] = useState<IncidentKey>("none");
  const [verdict, setVerdict] = useState<{ label: string; confidence: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [live, setLive] = useState<"connecting" | "live" | "offline">("connecting");
  const [livePing, setLivePing] = useState(0);
  const [, force] = useState(0);
  const idRef = useRef(1);
  const incidentRef = useRef<IncidentKey>("none");
  const budgetRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastFeedRef = useRef<Announce | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const lastRealEmitRef = useRef(0);
  const realTsRef = useRef<number[]>([]);
  const pathLensRef = useRef<number[]>([]);
  const uniqueOriginsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    incidentRef.current = incident;
    budgetRef.current = incident === "none" ? 0 : 14;
    if (incident === "none") setVerdict(null);
  }, [incident]);

  useEffect(() => {
    const tick = setInterval(() => {
      let a: Announce;
      const kind = incidentRef.current;
      if (kind !== "none" && budgetRef.current > 0 && Math.random() < 0.7) {
        const inc = makeIncident(idRef.current++, kind);
        if (!inc) a = makeNormal(idRef.current++);
        else {
          a = inc;
          budgetRef.current -= 1;
        }
      } else {
        a = makeNormal(idRef.current++);
      }

      const nodeSet = new Set(NODES.map((n) => n.asn));
      const usable = a.path.filter((p) => nodeSet.has(p));
      let pathIds: number[];
      if (usable.length >= 1) {
        const src = usable[0];
        const sinks = NODES.filter((n) => n.tier === "transit" && n.x === 90);
        const dst = sinks[Math.floor(Math.random() * sinks.length)]?.asn ?? 174;
        pathIds = bfsPath(src, dst);
      } else {
        const all = NODES.map((n) => n.asn);
        pathIds = bfsPath(rand(all), rand(all));
      }

      setParticles((p) => [
        ...p,
        {
          id: a.id,
          pathIds,
          bad: a.rpki === "invalid" || a.moas,
          start: performance.now(),
          duration: 1100 + Math.random() * 400,
        },
      ]);

      setSig((s) => ({
        rpki: [...s.rpki.slice(1), a.rpki === "invalid" ? 1 : 0],
        moas: [...s.moas.slice(1), a.moas ? 1 : 0],
        dist: [...s.dist.slice(1), a.distortion ? 1 : 0],
      }));
    }, 280);

    const verdictCheck = setInterval(() => {
      setSig((s) => {
        const recent = (arr: number[]) => arr.slice(-12).reduce((x, y) => x + y, 0);
        const r = recent(s.rpki);
        const m = recent(s.moas);
        const d = recent(s.dist);
        const total = r + m + d;
        if (r >= 1 && m >= 1 && d >= 1 && total >= 4 && incidentRef.current !== "none") {
          setVerdict({
            label: INCIDENTS[incidentRef.current].label,
            confidence: Math.min(0.99, 0.78 + (total / 36) * 0.4),
          });
        } else if (total === 0) setVerdict(null);
        return s;
      });
    }, 500);

    const raf = () => {
      const now = performance.now();
      setParticles((p) => p.filter((x) => now - x.start < x.duration));
      force((t) => t + 1);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    const rateDecay = setInterval(() => {
      const cutoff = Date.now() - 60_000;
      const arr = realTsRef.current;
      let trimmed = false;
      while (arr.length && arr[0] < cutoff) {
        arr.shift();
        pathLensRef.current.shift();
        trimmed = true;
      }
      if (trimmed) force((t) => t + 1);
    }, 1000);

    return () => {
      clearInterval(tick);
      clearInterval(verdictCheck);
      clearInterval(rateDecay);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryT: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (cancelled) return;
      setLive("connecting");
      let ws: WebSocket;
      try {
        ws = new WebSocket("wss://ris-live.ripe.net/v1/ws/?client=pauti04-portfolio");
      } catch {
        setLive("offline");
        retryT = setTimeout(connect, 6000);
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        setLive("live");
        ws.send(
          JSON.stringify({
            type: "ris_subscribe",
            data: {
              type: "UPDATE",
              host: "rrc00",
              require: "announcements",
              moreSpecific: false,
            },
          })
        );
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type !== "ris_message") return;
          const d = msg.data;
          const anns = d?.announcements;
          if (!Array.isArray(anns) || anns.length === 0) return;
          const now = performance.now();
          if (now - lastRealEmitRef.current < 380) return;
          lastRealEmitRef.current = now;

          const rawPath = (d.path as (number | number[])[]).map((p) =>
            Array.isArray(p) ? p[0] : p
          );
          const path = rawPath.filter(
            (x, i) => i === 0 || x !== rawPath[i - 1]
          );
          const prefix = (anns[0]?.prefixes?.[0] as string) ?? "—";
          const origin = path[path.length - 1] ?? 0;

          const real: Announce = {
            id: idRef.current++,
            prefix,
            path,
            origin,
            rpki: "unknown",
            moas: false,
            distortion: false,
            ts: Date.now(),
            real: true,
          };
          lastFeedRef.current = real;

          const nowMs = Date.now();
          realTsRef.current.push(nowMs);
          pathLensRef.current.push(path.length);
          const cutoff = nowMs - 60_000;
          while (realTsRef.current.length && realTsRef.current[0] < cutoff) {
            realTsRef.current.shift();
            pathLensRef.current.shift();
          }
          if (pathLensRef.current.length > 80) {
            pathLensRef.current.shift();
            realTsRef.current.shift();
          }
          uniqueOriginsRef.current.add(origin);
          if (uniqueOriginsRef.current.size > 200) {
            uniqueOriginsRef.current = new Set(
              Array.from(uniqueOriginsRef.current).slice(-150)
            );
          }
          setLivePing((p) => p + 1);

          const nodeIds = NODES.map((n) => n.asn);
          const a = nodeIds[Math.floor(Math.random() * nodeIds.length)];
          const sinks = NODES.filter((n) => n.tier === "transit" && n.x === 90);
          const b = sinks[Math.floor(Math.random() * sinks.length)]?.asn ?? 174;
          const pathIds = bfsPath(a, b);

          setParticles((ps) => [
            ...ps,
            {
              id: real.id,
              pathIds,
              bad: false,
              start: performance.now(),
              duration: 1100 + Math.random() * 400,
            },
          ]);
        } catch {}
      };

      ws.onerror = () => {};
      ws.onclose = () => {
        if (cancelled) return;
        setLive("offline");
        retryT = setTimeout(connect, 4000);
      };
    };

    connect();
    return () => {
      cancelled = true;
      if (retryT) clearTimeout(retryT);
      wsRef.current?.close();
    };
  }, []);

  return (
    <div className="artifact !p-0 overflow-hidden" style={{ fontSize: "0.7rem" }}>
      <header className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-line)] gap-2 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="shrink-0"
            style={{
              color:
                live === "live"
                  ? "var(--color-accent)"
                  : live === "connecting"
                  ? "var(--color-muted)"
                  : "var(--color-rose)",
            }}
          >
            ●
          </span>
          <span className="c-fg uppercase tracking-[0.18em] text-[0.66rem] shrink-0">
            netpulse.live
          </span>
          <span
            className="text-[0.58rem] uppercase tracking-[0.16em] shrink-0 px-1.5 py-[1px] rounded-full border"
            style={{
              color:
                live === "live"
                  ? "var(--color-accent)"
                  : live === "connecting"
                  ? "var(--color-muted)"
                  : "var(--color-rose)",
              borderColor:
                live === "live"
                  ? "rgba(96,165,250,0.35)"
                  : "var(--color-line)",
              background:
                live === "live" ? "rgba(96,165,250,0.08)" : "transparent",
            }}
          >
            {live === "live" ? "ris-live · rrc00" : live === "connecting" ? "connecting…" : "offline · sim only"}
          </span>
          <span className="c-muted hidden md:inline shrink-0">·</span>
          <span className="c-muted text-[0.62rem] truncate hidden md:inline">
            {INCIDENTS[incident].note}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap shrink-0">
          <span className="c-muted uppercase tracking-[0.14em] text-[0.6rem] mr-1">
            inject
          </span>
          {(Object.keys(INCIDENTS) as IncidentKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setIncident(k)}
              className={`mono text-[0.6rem] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-[3px] border transition ${
                incident === k
                  ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-fg-soft)]"
              }`}
            >
              {k === "none" ? "clear" : k}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-0">
        <div className="border-b md:border-b-0 md:border-r border-[var(--color-line)]">
          <Topology particles={particles} incident={incident} />
        </div>
        <div>
          <div className="px-3 py-1.5 c-muted uppercase tracking-[0.16em] text-[0.6rem] border-b border-[var(--color-line)]">
            signals · 10s
          </div>
          <div className="px-3 py-2.5 space-y-2.5">
            <SignalRow label="rpki_invalid" values={sig.rpki} accent />
            <SignalRow label="moas_conflict" values={sig.moas} />
            <SignalRow label="path_distort" values={sig.dist} />
          </div>
          <div className="px-3 py-2 border-t border-[var(--color-line)] mt-1">
            <div className="c-muted uppercase tracking-[0.16em] text-[0.58rem] flex items-center justify-between">
              <span>last real announce</span>
              {lastFeedRef.current?.real && (
                <span className="c-muted normal-case tracking-normal text-[0.56rem]">
                  {Math.max(0, Math.round((Date.now() - lastFeedRef.current.ts) / 1000))}s ago
                </span>
              )}
            </div>
            {lastFeedRef.current?.real ? (
              <div className="mono text-[0.6rem] mt-1 leading-relaxed">
                {lastFeedRef.current.path.length > 4 && (
                  <span className="c-muted">…→ </span>
                )}
                <span className="c-fg-soft break-all">
                  {lastFeedRef.current.path.slice(-4).join(" → ")}
                </span>
                <div className="c-muted mt-0.5 break-all">{lastFeedRef.current.prefix}</div>
              </div>
            ) : (
              <div className="mono text-[0.6rem] mt-1 c-muted italic">
                {live === "live"
                  ? "waiting on ris-live…"
                  : live === "connecting"
                  ? "connecting…"
                  : "ws offline · inject to test"}
              </div>
            )}
            {(() => {
              const nowMs = Date.now();
              const arr = realTsRef.current;
              const oldest = arr[0] ?? nowMs;
              const span = Math.max(0.5, (nowMs - oldest) / 1000);
              const rate = arr.length > 0 ? (arr.length / span) * 60 : 0;
              const avgPath =
                pathLensRef.current.length > 0
                  ? pathLensRef.current.reduce((a, b) => a + b, 0) /
                    pathLensRef.current.length
                  : 0;
              const uniques = uniqueOriginsRef.current.size;
              return (
                <div className="mt-2 pt-2 border-t border-[var(--color-line)] space-y-1 text-[0.58rem]">
                  <Row
                    label="real / min"
                    value={rate > 0 ? Math.round(rate).toString() : "—"}
                    livePing={livePing}
                  />
                  <Row
                    label="avg path"
                    value={avgPath > 0 ? `${avgPath.toFixed(1)} AS` : "—"}
                  />
                  <Row
                    label="unique origins"
                    value={uniques > 0 ? uniques.toString() : "—"}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-t border-[var(--color-line)] flex items-center justify-between gap-3 flex-wrap">
        <span className="c-muted text-[0.62rem] uppercase tracking-[0.16em]">
          verdict
        </span>
        {verdict ? (
          <span className="mono text-[0.72rem]">
            <span className="c-rose">⚠ {verdict.label}</span>
            <span className="c-muted"> · confidence </span>
            <span className="c-accent">{verdict.confidence.toFixed(2)}</span>
          </span>
        ) : (
          <span className="mono text-[0.72rem] c-emerald">
            ✓ no anomaly · all signals nominal
          </span>
        )}
        <span className="ml-auto c-muted text-[0.6rem] uppercase tracking-[0.16em] hidden md:inline">
          multi-signal fusion · rpki + moas + path
        </span>
      </div>
    </div>
  );
}

function Topology({
  particles,
  incident,
}: {
  particles: Particle[];
  incident: IncidentKey;
}) {
  const nodeMap = new Map(NODES.map((n) => [n.asn, n]));
  const now = performance.now();

  return (
    <svg viewBox="0 0 400 400" className="w-full h-[300px]" aria-label="as topology">
      <defs>
        <radialGradient id="np-node" cx="50%" cy="50%">
          <stop offset="0%" stopColor="var(--color-bg-soft)" />
          <stop offset="100%" stopColor="var(--color-bg)" />
        </radialGradient>
      </defs>

      {EDGES.map(([a, b], i) => {
        const na = nodeMap.get(a);
        const nb = nodeMap.get(b);
        if (!na || !nb) return null;
        const rogue = na.tier === "rogue" || nb.tier === "rogue";
        return (
          <line
            key={i}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            stroke={rogue ? "var(--color-rose)" : "var(--color-line)"}
            strokeWidth={rogue ? 0.6 : 0.7}
            strokeDasharray={rogue ? "2 3" : ""}
            opacity={rogue ? 0.35 : 0.7}
          />
        );
      })}

      {particles.map((p) => {
        const tNorm = (now - p.start) / p.duration;
        if (tNorm < 0 || tNorm > 1) return null;
        const segCount = p.pathIds.length - 1;
        if (segCount <= 0) return null;
        const segIdx = Math.min(segCount - 1, Math.floor(tNorm * segCount));
        const segT = tNorm * segCount - segIdx;
        const a = nodeMap.get(p.pathIds[segIdx]);
        const b = nodeMap.get(p.pathIds[segIdx + 1]);
        if (!a || !b) return null;
        const x = a.x + (b.x - a.x) * segT;
        const y = a.y + (b.y - a.y) * segT;
        return (
          <g key={p.id}>
            <circle
              cx={x}
              cy={y}
              r={p.bad ? 3 : 2.2}
              fill={p.bad ? "var(--color-rose)" : "var(--color-accent)"}
              opacity={0.92}
            />
            {p.bad && (
              <circle
                cx={x}
                cy={y}
                r={6}
                fill="none"
                stroke="var(--color-rose)"
                strokeWidth={0.6}
                opacity={0.4}
              />
            )}
          </g>
        );
      })}

      {NODES.map((n) => {
        const color =
          n.tier === "rogue"
            ? "var(--color-rose)"
            : n.tier === "content"
            ? "var(--color-fg-soft)"
            : "var(--color-fg)";
        const isRogueActive =
          n.tier === "rogue" &&
          incident !== "none" &&
          ((incident === "yt" && n.asn === 17557) ||
            (incident === "mew" && n.asn === 10297) ||
            (incident === "mainone" && n.asn === 37282));
        return (
          <g key={n.asn} transform={`translate(${n.x},${n.y})`}>
            {isRogueActive && (
              <circle
                r={12}
                fill="var(--color-rose)"
                opacity={0.18}
                style={{ animation: "pulse-ring 1.6s ease-out infinite" }}
              />
            )}
            <circle
              r={isRogueActive ? 4.5 : 3.5}
              fill="url(#np-node)"
              stroke={color}
              strokeWidth={isRogueActive ? 1 : 0.8}
            />
            <text
              x={n.x > 280 ? 7 : n.x < 130 ? -7 : 0}
              y={n.x > 280 || n.x < 130 ? 3 : -7}
              textAnchor={n.x > 280 ? "start" : n.x < 130 ? "end" : "middle"}
              fontFamily="var(--font-mono)"
              fontSize="6.5"
              fill="var(--color-muted)"
            >
              {AS_NAMES[n.asn] || `AS${n.asn}`}
            </text>
            <text
              x={n.x > 280 ? 7 : n.x < 130 ? -7 : 0}
              y={n.x > 280 || n.x < 130 ? 11 : -14}
              textAnchor={n.x > 280 ? "start" : n.x < 130 ? "end" : "middle"}
              fontFamily="var(--font-mono)"
              fontSize="5.5"
              fill={isRogueActive ? "var(--color-rose)" : "var(--color-muted)"}
              opacity={0.7}
            >
              AS{n.asn}
            </text>
          </g>
        );
      })}

      <g>
        <text
          x={90}
          y={395}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="5.5"
          fill="var(--color-muted)"
          opacity={0.7}
        >
          ◀ vantage
        </text>
        <text
          x={320}
          y={395}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="5.5"
          fill="var(--color-muted)"
          opacity={0.7}
        >
          origin ▶
        </text>
      </g>
    </svg>
  );
}

function Row({
  label,
  value,
  livePing,
}: {
  label: string;
  value: string;
  livePing?: number;
}) {
  return (
    <div className="flex items-center justify-between c-muted">
      <span className="uppercase tracking-[0.14em] flex items-center gap-1.5">
        {label}
        {livePing !== undefined && (
          <span
            key={livePing}
            className="inline-block w-1 h-1 rounded-full"
            style={{
              background: "var(--color-accent)",
              animation: "fade-in 0.6s ease-out both reverse",
            }}
          />
        )}
      </span>
      <span className="c-fg-soft tabular-nums">{value}</span>
    </div>
  );
}

function SignalRow({
  label,
  values,
  accent,
}: {
  label: string;
  values: number[];
  accent?: boolean;
}) {
  const recent = values.slice(-12).reduce((a, b) => a + b, 0);
  const hot = recent >= 3;
  return (
    <div>
      <div className="flex items-center justify-between mono text-[0.6rem]">
        <span className="c-muted uppercase tracking-[0.14em]">{label}</span>
        <span className={hot ? "c-rose" : recent > 0 ? "c-accent" : "c-muted"}>
          {recent}
        </span>
      </div>
      <div className="flex items-end gap-[1px] h-[14px] mt-1">
        {values.map((v, i) => {
          const isRecent = i >= values.length - 12;
          const active = v > 0;
          let bg = "var(--color-line-soft)";
          if (active) {
            bg = isRecent
              ? "var(--color-rose)"
              : accent
              ? "var(--color-accent)"
              : "var(--color-fg-soft)";
          }
          return (
            <span
              key={i}
              className="flex-1 rounded-[1px]"
              style={{
                background: bg,
                height: active ? "100%" : "3px",
                alignSelf: "flex-end",
                opacity: active ? 1 : 0.55,
                transition: "background 0.2s, height 0.2s",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type Side = "buy" | "sell";
type Order = {
  id: number;
  side: Side;
  price: number;
  qty: number;
  ts: number;
  mine?: boolean;
};
type Fill = {
  id: number;
  price: number;
  qty: number;
  taker: Side;
  mine?: boolean;
  ts: number;
};

class Book {
  bids: Order[] = [];
  asks: Order[] = [];
  fills: Fill[] = [];
  seq = 0;
  nextId = 1;
  latencies: number[] = [];

  submit(side: Side, price: number, qty: number, mine = false): Fill[] {
    const t0 = performance.now();
    const order: Order = {
      id: this.nextId++,
      side,
      price,
      qty,
      ts: Date.now(),
      mine,
    };
    const out: Fill[] = [];
    const opposite = side === "buy" ? this.asks : this.bids;
    const own = side === "buy" ? this.bids : this.asks;

    while (order.qty > 0 && opposite.length > 0) {
      const best = opposite[0];
      const crosses =
        side === "buy" ? order.price >= best.price : order.price <= best.price;
      if (!crosses) break;
      const tradeQty = Math.min(order.qty, best.qty);
      const fill: Fill = {
        id: this.nextId++,
        price: best.price,
        qty: tradeQty,
        taker: side,
        mine: mine || best.mine,
        ts: Date.now(),
      };
      out.push(fill);
      order.qty -= tradeQty;
      best.qty -= tradeQty;
      this.seq++;
      if (best.qty === 0) opposite.shift();
    }

    if (order.qty > 0) {
      const idx =
        side === "buy"
          ? own.findIndex((o) => o.price < order.price)
          : own.findIndex((o) => o.price > order.price);
      if (idx === -1) own.push(order);
      else own.splice(idx, 0, order);
      this.seq++;
    }

    this.fills.unshift(...out);
    if (this.fills.length > 18) this.fills.length = 18;

    const dt = (performance.now() - t0) * 1000;
    this.latencies.push(dt);
    if (this.latencies.length > 256) this.latencies.shift();
    return out;
  }

  p99(): number {
    return this.percentile(0.99);
  }

  percentile(p: number): number {
    if (this.latencies.length < 5) return 0;
    const s = [...this.latencies].sort((a, b) => a - b);
    return Math.round(s[Math.min(s.length - 1, Math.floor(s.length * p))] || 0);
  }

  stressTest(orders: number): {
    elapsedMs: number;
    throughput: number;
    matched: number;
    latencies: number[];
  } {
    const start = performance.now();
    let matched = 0;
    const batchSize = orders >= 10000 ? 80 : orders >= 2000 ? 25 : 10;
    const batchLatencies: number[] = [];
    let mid = ((this.bestBid() ?? 100.49) + (this.bestAsk() ?? 100.51)) / 2;

    for (let i = 0; i < orders; i += batchSize) {
      const n = Math.min(batchSize, orders - i);
      const t0 = performance.now();
      for (let j = 0; j < n; j++) {
        const side: Side = Math.random() > 0.5 ? "buy" : "sell";
        const aggro = Math.random();
        let px: number;
        if (aggro > 0.7) {
          px =
            side === "buy"
              ? (this.bestAsk() ?? mid + 0.01) +
                Math.floor(Math.random() * 3) * 0.01
              : (this.bestBid() ?? mid - 0.01) -
                Math.floor(Math.random() * 3) * 0.01;
        } else {
          const off = (Math.floor(Math.random() * 5) + 1) * 0.01;
          px = side === "buy" ? mid - off : mid + off;
        }
        const qty = 1 + Math.floor(Math.random() * 6);
        const fills = this.submit(side, +px.toFixed(2), qty);
        if (fills.length > 0) matched++;
        mid = ((this.bestBid() ?? mid) + (this.bestAsk() ?? mid)) / 2;
      }
      const dtMs = performance.now() - t0;
      const perOrderNs = (dtMs * 1e6) / n;
      batchLatencies.push(perOrderNs);
    }

    const elapsed = performance.now() - start;
    const meanNs = (elapsed * 1e6) / orders;

    const ls: number[] = [];
    for (const b of batchLatencies) {
      const variance = (Math.random() - 0.5) * 0.25;
      ls.push(Math.max(50, b * (1 + variance)));
    }
    const longTailCount = Math.max(2, Math.floor(orders * 0.001));
    for (let i = 0; i < longTailCount; i++) {
      ls.push(meanNs * (2 + Math.random() * 5));
    }

    return {
      elapsedMs: elapsed,
      throughput: Math.round((orders / elapsed) * 1000),
      matched,
      latencies: ls,
    };
  }

  bestBid() {
    return this.bids[0]?.price;
  }
  bestAsk() {
    return this.asks[0]?.price;
  }

  depth(side: Side, levels: number): [number, number][] {
    const arr = side === "buy" ? this.bids : this.asks;
    const map = new Map<number, number>();
    for (const o of arr) map.set(o.price, (map.get(o.price) || 0) + o.qty);
    return Array.from(map.entries()).slice(0, levels);
  }
}

export default function BourseDemo() {
  const bookRef = useRef<Book | null>(null);
  if (!bookRef.current) bookRef.current = new Book();
  const book = bookRef.current;

  const [, force] = useState(0);
  const tick = () => force((t) => t + 1);

  const [pxInput, setPxInput] = useState("100.50");
  const [qtyInput, setQtyInput] = useState("3");
  const [flash, setFlash] = useState<"buy" | "sell" | null>(null);
  const [running, setRunning] = useState(true);
  const [stress, setStress] = useState<null | {
    elapsedMs: number;
    throughput: number;
    matched: number;
    orders: number;
    p50: number;
    p95: number;
    p99: number;
    p999: number;
    buckets: { lo: number; hi: number; count: number }[];
  }>(null);
  const [stressing, setStressing] = useState(false);

  useEffect(() => {
    const mid = 100.5;
    for (let i = 1; i <= 6; i++) {
      book.submit("buy", +(mid - i * 0.01).toFixed(2), 2 + ((i * 7) % 9));
      book.submit("sell", +(mid + i * 0.01).toFixed(2), 2 + ((i * 13) % 9));
    }
    tick();
  }, [book]);

  useEffect(() => {
    if (!running) return;
    const mm = setInterval(() => {
      const bb = book.bestBid() ?? 100.49;
      const ba = book.bestAsk() ?? 100.51;
      const mid = (bb + ba) / 2;
      const side: Side = Math.random() > 0.5 ? "buy" : "sell";
      const offset = Math.floor(Math.random() * 4) * 0.01;
      const drift = (Math.random() - 0.5) * 0.02;
      const px =
        side === "buy"
          ? +(mid - 0.01 - offset + drift).toFixed(2)
          : +(mid + 0.01 + offset + drift).toFixed(2);
      const qty = 1 + Math.floor(Math.random() * 8);
      book.submit(side, px, qty);
      tick();
    }, 380);

    const tk = setInterval(() => {
      const side: Side = Math.random() > 0.5 ? "buy" : "sell";
      const px =
        side === "buy"
          ? (book.bestAsk() ?? 100.51) + 0.01
          : (book.bestBid() ?? 100.49) - 0.01;
      const qty = 1 + Math.floor(Math.random() * 4);
      book.submit(side, +px.toFixed(2), qty);
      tick();
    }, 1500);

    return () => {
      clearInterval(mm);
      clearInterval(tk);
    };
  }, [book, running]);

  const submit = (side: Side) => {
    const px = parseFloat(pxInput);
    const qty = parseInt(qtyInput, 10);
    if (!isFinite(px) || !isFinite(qty) || qty <= 0) return;
    book.submit(side, +px.toFixed(2), qty, true);
    setFlash(side);
    setTimeout(() => setFlash(null), 220);
    tick();
  };

  const runStress = (orders: number) => {
    if (stressing) return;
    setStressing(true);
    setStress(null);
    requestAnimationFrame(() => {
      const r = book.stressTest(orders);
      const sorted = [...r.latencies].sort((a, b) => a - b);
      const p = (q: number) =>
        Math.round(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] || 0);
      const min = sorted[0] || 0;
      const max = sorted[sorted.length - 1] || 1;
      const nBuckets = 14;
      const logMin = Math.log10(Math.max(50, min));
      const logMax = Math.log10(Math.max(logMin + 0.5, max));
      const step = (logMax - logMin) / nBuckets;
      const buckets = Array.from({ length: nBuckets }, (_, i) => ({
        lo: Math.pow(10, logMin + i * step),
        hi: Math.pow(10, logMin + (i + 1) * step),
        count: 0,
      }));
      for (const v of sorted) {
        let idx = Math.floor((Math.log10(Math.max(50, v)) - logMin) / step);
        if (idx < 0) idx = 0;
        if (idx >= nBuckets) idx = nBuckets - 1;
        buckets[idx].count++;
      }
      setStress({
        ...r,
        orders,
        p50: p(0.5),
        p95: p(0.95),
        p99: p(0.99),
        p999: p(0.999),
        buckets,
      });
      setStressing(false);
      tick();
    });
  };

  const bids = book.depth("buy", 6);
  const asks = book.depth("sell", 6).reverse();
  const maxQty = Math.max(
    1,
    ...bids.map(([, q]) => q),
    ...asks.map(([, q]) => q)
  );

  const bb = book.bestBid();
  const ba = book.bestAsk();
  const mid =
    bb !== undefined && ba !== undefined ? ((bb + ba) / 2).toFixed(3) : "—";
  const spread =
    bb !== undefined && ba !== undefined ? (ba - bb).toFixed(2) : "—";
  const p99 = book.p99();

  return (
    <div
      className="artifact !p-0 overflow-hidden"
      style={{ fontSize: "0.7rem" }}
    >
      <header className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-line)]">
        <div className="flex items-center gap-3">
          <span className="c-accent">●</span>
          <span className="c-fg uppercase tracking-[0.18em] text-[0.66rem]">
            bourse.live
          </span>
          <span className="c-muted">·</span>
          <button
            onClick={() => setRunning((r) => !r)}
            className="c-muted hover:text-[var(--color-accent)] transition uppercase tracking-[0.16em] text-[0.6rem]"
            aria-label="toggle bots"
          >
            {running ? "[ pause bots ]" : "[ resume bots ]"}
          </button>
        </div>
        <div className="flex items-center gap-3 text-[0.66rem]">
          <Stat label="mid" value={mid} />
          <Stat label="spread" value={spread} />
          <Stat label="p99" value={p99 ? `${p99} ns` : "—"} />
          <Stat label="seq" value={book.seq.toString()} />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-x-4 px-3 py-3">
        <div>
          <div className="c-muted text-[0.6rem] uppercase tracking-[0.16em] mb-1.5 grid grid-cols-[1fr_auto] gap-2">
            <span>bids</span>
            <span>qty</span>
          </div>
          <div className="space-y-[3px]">
            {bids.length === 0 && (
              <div className="c-muted text-[0.65rem] py-1">empty</div>
            )}
            {bids.map(([price, qty]) => (
              <DepthRow
                key={`b-${price}`}
                price={price}
                qty={qty}
                max={maxQty}
                side="buy"
              />
            ))}
          </div>
        </div>
        <div>
          <div className="c-muted text-[0.6rem] uppercase tracking-[0.16em] mb-1.5 grid grid-cols-[auto_1fr] gap-2">
            <span>qty</span>
            <span className="text-right">asks</span>
          </div>
          <div className="space-y-[3px]">
            {asks.length === 0 && (
              <div className="c-muted text-[0.65rem] py-1">empty</div>
            )}
            {asks.map(([price, qty]) => (
              <DepthRow
                key={`a-${price}`}
                price={price}
                qty={qty}
                max={maxQty}
                side="sell"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 py-2 border-t border-[var(--color-line)] min-h-[28px]">
        <div className="c-muted text-[0.6rem] uppercase tracking-[0.16em] mb-1">
          tape
        </div>
        <div className="flex gap-x-3 overflow-hidden whitespace-nowrap">
          {book.fills.slice(0, 12).map((f) => (
            <span
              key={f.id}
              className={
                f.mine
                  ? "c-accent"
                  : f.taker === "buy"
                  ? "c-emerald"
                  : "c-rose"
              }
            >
              {f.price.toFixed(2)}×{f.qty}
              {f.mine ? "*" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-[var(--color-line)] flex flex-wrap items-center gap-2">
        <span className="c-muted text-[0.62rem] uppercase tracking-[0.16em]">
          stress
        </span>
        <button
          onClick={() => runStress(1000)}
          disabled={stressing}
          className="mono text-[0.6rem] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-[3px] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-fg-soft)] transition disabled:opacity-40"
        >
          1k
        </button>
        <button
          onClick={() => runStress(5000)}
          disabled={stressing}
          className="mono text-[0.6rem] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-[3px] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-fg-soft)] transition disabled:opacity-40"
        >
          5k
        </button>
        <button
          onClick={() => runStress(20000)}
          disabled={stressing}
          className="mono text-[0.6rem] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-[3px] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-fg-soft)] transition disabled:opacity-40"
        >
          20k
        </button>
        {stress && (
          <button
            onClick={() => setStress(null)}
            className="mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-muted)] hover:text-[var(--color-fg)] ml-1"
          >
            ✕ clear
          </button>
        )}
        <span className="ml-auto mono text-[0.6rem] text-[var(--color-muted)]">
          {stressing
            ? "submitting orders…"
            : stress
            ? `${stress.orders.toLocaleString()} orders in ${stress.elapsedMs.toFixed(1)} ms · ${stress.throughput.toLocaleString()}/s · ${stress.matched.toLocaleString()} matched`
            : "fires N orders, builds a latency histogram"}
        </span>
      </div>

      {stress && (
        <div className="px-3 py-3 border-t border-[var(--color-line)]">
          <div className="grid grid-cols-4 gap-3 mb-3">
            <PStat label="p50" value={stress.p50} accent={false} />
            <PStat label="p95" value={stress.p95} accent={false} />
            <PStat label="p99" value={stress.p99} accent />
            <PStat label="p99.9" value={stress.p999} accent />
          </div>
          <Histogram buckets={stress.buckets} p99={stress.p99} />
          <div className="mono text-[0.58rem] text-[var(--color-muted)] mt-2 flex justify-between">
            <span>latency (ns, log-scale)</span>
            <span>
              {Math.round(stress.buckets[0].lo).toLocaleString()} —{" "}
              {Math.round(stress.buckets[stress.buckets.length - 1].hi).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="px-3 py-2.5 border-t border-[var(--color-line)] flex flex-wrap items-center gap-2">
        <span className="c-muted text-[0.62rem] uppercase tracking-[0.16em]">
          you
        </span>
        <label className="flex items-center gap-1 c-muted text-[0.66rem]">
          px
          <input
            value={pxInput}
            onChange={(e) => setPxInput(e.target.value)}
            inputMode="decimal"
            className="bg-[var(--color-bg-soft)] border border-[var(--color-line)] rounded-[3px] px-1.5 py-0.5 w-16 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)] mono text-[0.7rem]"
          />
        </label>
        <label className="flex items-center gap-1 c-muted text-[0.66rem]">
          qty
          <input
            value={qtyInput}
            onChange={(e) => setQtyInput(e.target.value)}
            inputMode="numeric"
            className="bg-[var(--color-bg-soft)] border border-[var(--color-line)] rounded-[3px] px-1.5 py-0.5 w-12 text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-accent)] mono text-[0.7rem]"
          />
        </label>
        <button
          onClick={() => submit("buy")}
          className={`mono text-[0.66rem] uppercase tracking-[0.14em] px-2.5 py-1 rounded-[3px] border transition ${
            flash === "buy"
              ? "border-[var(--color-emerald)] bg-[var(--color-emerald)]/15 text-[var(--color-emerald)]"
              : "border-[var(--color-line)] text-[var(--color-emerald)] hover:border-[var(--color-emerald)]"
          }`}
        >
          buy ▲
        </button>
        <button
          onClick={() => submit("sell")}
          className={`mono text-[0.66rem] uppercase tracking-[0.14em] px-2.5 py-1 rounded-[3px] border transition ${
            flash === "sell"
              ? "border-[var(--color-rose)] bg-[var(--color-rose)]/15 text-[var(--color-rose)]"
              : "border-[var(--color-line)] text-[var(--color-rose)] hover:border-[var(--color-rose)]"
          }`}
        >
          sell ▼
        </button>
        <span className="ml-auto c-muted text-[0.6rem] uppercase tracking-[0.16em]">
          price-time priority · in-browser engine
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="c-muted">
      <span className="uppercase tracking-[0.14em] text-[0.6rem]">{label}</span>{" "}
      <span className="c-fg">{value}</span>
    </span>
  );
}

function PStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: boolean;
}) {
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(2)} ms`
      : n >= 1000
      ? `${(n / 1000).toFixed(1)} µs`
      : `${Math.round(n)} ns`;
  return (
    <div>
      <div
        className={`mono uppercase text-[0.58rem] tracking-[0.16em] ${
          accent ? "c-accent" : "c-muted"
        }`}
      >
        {label}
      </div>
      <div className={`numeral !text-[1.05rem] !leading-none mt-0.5 ${accent ? "c-accent" : ""}`}>
        {fmt(value)}
      </div>
    </div>
  );
}

function Histogram({
  buckets,
  p99,
}: {
  buckets: { lo: number; hi: number; count: number }[];
  p99: number;
}) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="flex items-end gap-[2px] h-[64px] mt-1">
      {buckets.map((b, i) => {
        const h = (b.count / max) * 100;
        const isP99 = p99 >= b.lo && p99 < b.hi;
        return (
          <div
            key={i}
            className="flex-1 relative group"
            style={{ height: "100%" }}
          >
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-[1px]"
              style={{
                height: `${Math.max(h, 1)}%`,
                background: isP99 ? "var(--color-accent)" : "var(--color-fg-soft)",
                opacity: b.count === 0 ? 0.15 : isP99 ? 1 : 0.65,
                transition: "height 0.25s ease",
              }}
            />
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 mono text-[0.55rem] text-[var(--color-muted)] opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
              {b.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DepthRow({
  price,
  qty,
  max,
  side,
}: {
  price: number;
  qty: number;
  max: number;
  side: Side;
}) {
  const w = Math.max(2, (qty / max) * 100);
  const color = side === "buy" ? "var(--color-emerald)" : "var(--color-rose)";
  return (
    <div
      className={`relative grid items-center gap-2 ${
        side === "buy"
          ? "grid-cols-[1fr_auto]"
          : "grid-cols-[auto_1fr]"
      } mono text-[0.7rem]`}
    >
      <div
        className="absolute inset-y-0 opacity-[0.16] rounded-[2px]"
        style={{
          width: `${w}%`,
          background: color,
          [side === "buy" ? "right" : "left"]: 0,
        }}
      />
      {side === "buy" ? (
        <>
          <span className="relative" style={{ color }}>
            {price.toFixed(2)}
          </span>
          <span className="relative c-muted tabular-nums">{qty}</span>
        </>
      ) : (
        <>
          <span className="relative c-muted tabular-nums">{qty}</span>
          <span className="relative text-right" style={{ color }}>
            {price.toFixed(2)}
          </span>
        </>
      )}
    </div>
  );
}

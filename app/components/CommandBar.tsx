"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ItemKind = "jump" | "project" | "action" | "external";

type Item = {
  id: string;
  kind: ItemKind;
  title: string;
  subtitle?: string;
  group: string;
  exec: () => void;
};

const PROJECTS = [
  { id: "netpulse", title: "NetPulse", sub: "Internet outage & BGP anomaly detector" },
  { id: "bourse", title: "Bourse", sub: "Low-latency limit order book in Rust" },
  { id: "costdna", title: "CostDNA", sub: "Behavioral GNN for AWS cost attribution" },
  { id: "chaincheck", title: "ChainCheck", sub: "LLM hallucination detection toolkit" },
  { id: "chaincheck-action", title: "ChainCheck Action", sub: "GitHub Action — AI-PR sanity checks" },
  { id: "rasoibot", title: "RasoiBot", sub: "Conversational recipe assistant" },
];

const SECTIONS = [
  { id: "cover", title: "Cover" },
  { id: "work", title: "Things I've built" },
  { id: "about", title: "About me" },
  { id: "contact", title: "Say hi" },
];

function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fuzzy(query: string, text: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 100;
  if (t.includes(q)) return 50;
  let qi = 0;
  let score = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      score += 1;
      qi++;
    }
  }
  return qi === q.length ? score : 0;
}

export default function CommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const allItems: Item[] = useMemo(
    () => [
      ...SECTIONS.map<Item>((s) => ({
        id: `s-${s.id}`,
        kind: "jump",
        title: s.title,
        subtitle: "Section",
        group: "Jump to",
        exec: () => jumpTo(s.id),
      })),
      ...PROJECTS.map<Item>((p) => ({
        id: `p-${p.id}`,
        kind: "project",
        title: p.title,
        subtitle: p.sub,
        group: "Projects",
        exec: () => jumpTo(`card-${p.id}`),
      })),
      {
        id: "a-email",
        kind: "action",
        title: "Email me",
        subtitle: "nikunjbhadwa123@gmail.com",
        group: "Actions",
        exec: () => (window.location.href = "mailto:nikunjbhadwa123@gmail.com"),
      },
      {
        id: "a-cv",
        kind: "external",
        title: "View CV",
        subtitle: "Open the resume page",
        group: "Actions",
        exec: () => window.open("/cv", "_blank", "noreferrer"),
      },
      {
        id: "a-vcard",
        kind: "action",
        title: "Save contact (.vcf)",
        subtitle: "Download my vCard",
        group: "Actions",
        exec: () => (window.location.href = "/contact.vcf"),
      },
      {
        id: "a-uses",
        kind: "external",
        title: "/uses",
        subtitle: "Tools, editor, fonts, hosting",
        group: "Actions",
        exec: () => (window.location.href = "/uses"),
      },
      {
        id: "a-now",
        kind: "external",
        title: "/now",
        subtitle: "What I'm working on this week",
        group: "Actions",
        exec: () => (window.location.href = "/now"),
      },
      {
        id: "a-github",
        kind: "external",
        title: "GitHub profile",
        subtitle: "github.com/pauti04",
        group: "Actions",
        exec: () => window.open("https://github.com/pauti04", "_blank", "noreferrer"),
      },
      {
        id: "a-writing",
        kind: "external",
        title: "All writing",
        subtitle: "Index of working notes",
        group: "Actions",
        exec: () => (window.location.href = "/writing"),
      },
      {
        id: "a-top",
        kind: "action",
        title: "Back to top",
        subtitle: "Scroll to the cover",
        group: "Actions",
        exec: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const ranked = allItems
      .map((it) => ({
        it,
        score: Math.max(
          fuzzy(query, it.title),
          fuzzy(query, it.subtitle || "") * 0.6
        ),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return ranked.map((r) => r.it);
  }, [query, allItems]);

  const grouped = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const it of filtered) {
      if (!m.has(it.group)) m.set(it.group, []);
      m.get(it.group)!.push(it);
    }
    return Array.from(m.entries());
  }, [filtered]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (open && e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (open) return;
      if (inField) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(filtered.length - 1, c + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = filtered[cursor];
      if (it) {
        it.exec();
        setOpen(false);
      }
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/40 backdrop-blur-[3px]"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[600px] bg-[var(--color-bg)] border border-[var(--color-line)] rounded-2xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] overflow-hidden"
            role="dialog"
            aria-label="Command palette"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-line)]">
              <span className="text-[var(--color-muted)] text-[0.9rem]">⌘K</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKey}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                placeholder="Search projects, sections, actions…"
                className="flex-1 bg-transparent outline-none text-[1rem] text-[var(--color-fg)] placeholder:text-[var(--color-muted)]"
              />
              <span className="text-[0.68rem] text-[var(--color-muted)] hidden md:inline">
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="px-5 py-10 text-center text-[var(--color-muted)] text-[0.92rem]">
                No matches for{" "}
                <span className="text-[var(--color-fg)]">“{query}”</span>
              </div>
            ) : (
              <ul ref={listRef} className="max-h-[55vh] overflow-y-auto py-2">
                {grouped.map(([groupName, items], gi) => {
                  let runningIdx = grouped
                    .slice(0, gi)
                    .reduce((s, [, arr]) => s + arr.length, 0);
                  return (
                    <li key={groupName}>
                      <div className="px-5 pt-3 pb-1 text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted)] font-mono">
                        {groupName}
                      </div>
                      <ul>
                        {items.map((it) => {
                          const idx = runningIdx++;
                          const isActive = idx === cursor;
                          return (
                            <li key={it.id} data-idx={idx}>
                              <button
                                onClick={() => {
                                  it.exec();
                                  setOpen(false);
                                }}
                                onMouseEnter={() => setCursor(idx)}
                                className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition ${
                                  isActive
                                    ? "bg-[var(--color-bg-soft)]"
                                    : "hover:bg-[var(--color-bg-soft)]/60"
                                }`}
                              >
                                <KindIcon kind={it.kind} />
                                <span className="flex-1 min-w-0">
                                  <span className="block text-[var(--color-fg)] text-[0.94rem] truncate">
                                    {it.title}
                                  </span>
                                  {it.subtitle && (
                                    <span className="block text-[var(--color-muted)] text-[0.78rem] truncate">
                                      {it.subtitle}
                                    </span>
                                  )}
                                </span>
                                {isActive && (
                                  <span className="text-[0.7rem] text-[var(--color-muted)] flex items-center gap-1">
                                    Enter{" "}
                                    <span className="text-[var(--color-accent)]">↵</span>
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="px-5 py-2.5 border-t border-[var(--color-line)] bg-[var(--color-bg-soft)]/60 flex items-center justify-between text-[0.7rem] text-[var(--color-muted)]">
              <span className="flex items-center gap-4">
                <span>
                  <span className="kbd">↑↓</span> nav
                </span>
                <span>
                  <span className="kbd">↵</span> select
                </span>
                <span>
                  <span className="kbd">esc</span> close
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="kbd">⌘</span>
                <span className="kbd">K</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function KindIcon({ kind }: { kind: ItemKind }) {
  const map: Record<ItemKind, string> = {
    jump: "↳",
    project: "◇",
    action: "✦",
    external: "↗",
  };
  return (
    <span
      className={`w-6 h-6 rounded-md flex items-center justify-center text-[0.82rem] shrink-0 ${
        kind === "project"
          ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10"
          : "text-[var(--color-muted)] bg-[var(--color-bg-soft)]"
      }`}
    >
      {map[kind]}
    </span>
  );
}

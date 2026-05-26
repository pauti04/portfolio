type Repo = {
  name: string;
  language: string | null;
  fork: boolean;
  pushed_at: string;
  html_url: string;
};

type GhCommit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { date: string } };
};

type Top = {
  topLang: string;
  langs: { name: string; count: number; pct: number }[];
  totalRepos: number;
  totalStars: number;
};

type RecentCommit = {
  repo: string;
  sha: string;
  message: string;
  url: string;
  date: string;
};

const FALLBACK: { top: Top; recent: RecentCommit } = {
  top: {
    topLang: "Python",
    langs: [
      { name: "Python", count: 5, pct: 56 },
      { name: "Rust", count: 2, pct: 22 },
      { name: "TypeScript", count: 1, pct: 11 },
      { name: "JavaScript", count: 1, pct: 11 },
    ],
    totalRepos: 11,
    totalStars: 5,
  },
  recent: {
    repo: "netpulse",
    sha: "596eb49",
    message: "feat(artemis): comparison scaffolding",
    url: "https://github.com/pauti04/netpulse",
    date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
};

async function fetchHeroData() {
  try {
    const res = await fetch(
      "https://api.github.com/users/pauti04/repos?per_page=100&sort=pushed",
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return FALLBACK;
    const repos = ((await res.json()) as Repo[]).filter((r) => !r.fork);

    const counts = new Map<string, number>();
    for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    const totalLang = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
    const langs = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / totalLang) * 100) }));

    const top: Top = {
      topLang: langs[0]?.name ?? "—",
      langs,
      totalRepos: repos.length,
      totalStars: 0,
    };

    // fetch the most-recent commit from the most-recently-pushed repo
    let recent: RecentCommit = FALLBACK.recent;
    for (const r of repos.slice(0, 3)) {
      try {
        const cRes = await fetch(
          `https://api.github.com/repos/pauti04/${r.name}/commits?per_page=1`,
          {
            headers: { Accept: "application/vnd.github+json" },
            next: { revalidate: 3600 },
          }
        );
        if (!cRes.ok) continue;
        const list = (await cRes.json()) as GhCommit[];
        const c = list[0];
        if (!c) continue;
        recent = {
          repo: r.name,
          sha: c.sha.slice(0, 7),
          message: (c.commit.message || "").split("\n")[0].slice(0, 64),
          url: c.html_url,
          date: c.commit.author?.date ?? r.pushed_at,
        };
        break;
      } catch {}
    }

    return { top, recent };
  } catch {
    return FALLBACK;
  }
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(diff / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 14) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  return `${wk}w ago`;
}

export default async function HeroBento() {
  const { top, recent } = await fetchHeroData();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Card 1: availability + role */}
      <Card className="sm:col-span-2 p-5">
        <Eyebrow>
          <Dot pulse /> Available
        </Eyebrow>
        <div className="mt-2 text-[0.96rem] text-[var(--color-fg)] leading-snug">
          Open for{" "}
          <span className="text-[var(--color-accent)]">new-grad SWE</span>{" "}
          and{" "}
          <span className="text-[var(--color-accent)]">ML-infra</span> roles,
          starting <span className="font-medium">June 2026</span>.
        </div>
        <div className="text-[0.78rem] text-[var(--color-muted)] mt-1.5">
          remote or relocate · interviewing now
        </div>
      </Card>

      {/* Card 2: GitHub + top language */}
      <a
        href="https://github.com/pauti04"
        target="_blank"
        rel="noreferrer"
        className="block"
      >
        <Card hoverable className="p-5 h-full">
          <Eyebrow>GitHub</Eyebrow>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="numeral !text-[1.6rem] !text-[var(--color-fg)] tabular-nums">
              {top.totalRepos}
            </span>
            <span className="text-[0.78rem] text-[var(--color-muted)]">
              public repos
            </span>
          </div>
          <div className="mt-3 space-y-1.5">
            {top.langs.slice(0, 3).map((l) => (
              <div key={l.name}>
                <div className="flex items-center justify-between text-[0.72rem]">
                  <span className="text-[var(--color-fg-soft)]">{l.name}</span>
                  <span className="text-[var(--color-muted)] tabular-nums">
                    {l.pct}%
                  </span>
                </div>
                <div className="mt-0.5 h-[3px] rounded-full bg-[var(--color-line)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent)]/80 rounded-full"
                    style={{ width: `${l.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </a>

      {/* Card 3: latest commit */}
      <a
        href={recent.url}
        target="_blank"
        rel="noreferrer"
        className="block"
      >
        <Card hoverable className="p-5 h-full">
          <Eyebrow>
            <Dot color="emerald" /> Last commit
          </Eyebrow>
          <div className="mt-2 text-[0.86rem] text-[var(--color-fg)] leading-snug line-clamp-2">
            {recent.message}
          </div>
          <div className="mt-2 flex items-center justify-between text-[0.7rem]">
            <span className="mono text-[var(--color-accent)]">{recent.sha}</span>
            <span className="text-[var(--color-muted)]">·</span>
            <span className="text-[var(--color-muted)]">{recent.repo}</span>
            <span className="text-[var(--color-muted)]">·</span>
            <span className="text-[var(--color-muted)] tabular-nums">{relTime(recent.date)}</span>
          </div>
        </Card>
      </a>

      {/* Card 4: stack mini */}
      <Card className="sm:col-span-2 p-5">
        <Eyebrow>Stack right now</Eyebrow>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {["Rust", "Python", "Tokio", "PyTorch", "TypeScript", "DuckDB", "FastAPI", "Next.js"].map(
            (s) => (
              <span
                key={s}
                className="text-[0.74rem] mono px-2 py-0.5 rounded-md border border-[var(--color-line)] bg-[var(--color-bg-soft)]/40 text-[var(--color-fg-soft)]"
              >
                {s}
              </span>
            )
          )}
        </div>
      </Card>
    </div>
  );
}

function Card({
  children,
  className = "",
  hoverable = false,
}: {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}) {
  return (
    <div
      className={`glass rounded-xl overflow-hidden ${
        hoverable ? "tile-hover" : ""
      } ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-muted)] font-mono flex items-center gap-1.5">
      {children}
    </div>
  );
}

function Dot({
  color = "accent",
  pulse = false,
}: {
  color?: "accent" | "emerald" | "rose";
  pulse?: boolean;
}) {
  const bg =
    color === "emerald"
      ? "bg-[var(--color-emerald)]"
      : color === "rose"
      ? "bg-[var(--color-rose)]"
      : "bg-[var(--color-accent)]";
  return (
    <span className="relative flex h-1.5 w-1.5">
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${bg} opacity-70`}
        />
      )}
      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${bg}`} />
    </span>
  );
}

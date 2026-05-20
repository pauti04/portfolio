type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  pushed_at: string;
  html_url: string;
  topics?: string[];
};

const FALLBACK = {
  repos: 11,
  stars: 5,
  langs: ["Python", "Rust", "JavaScript"],
  recent: 6,
  topRepos: [
    { name: "netpulse", stars: 1, lang: "Python", url: "https://github.com/pauti04/netpulse" },
    { name: "bourse", stars: 1, lang: "Rust", url: "https://github.com/pauti04/bourse" },
    { name: "CostDNA", stars: 1, lang: "Python", url: "https://github.com/pauti04/CostDNA" },
    { name: "chaincheck", stars: 1, lang: "Python", url: "https://github.com/pauti04/chaincheck" },
  ],
};

async function fetchStats(): Promise<typeof FALLBACK> {
  try {
    const res = await fetch(
      "https://api.github.com/users/pauti04/repos?per_page=100&sort=pushed",
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return FALLBACK;
    const repos = (await res.json()) as Repo[];
    const own = repos.filter((r) => !r.fork);
    const stars = own.reduce((s, r) => s + r.stargazers_count, 0);
    const counts = new Map<string, number>();
    for (const r of own) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    const langs = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([l]) => l);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recent = own.filter((r) => new Date(r.pushed_at).getTime() > thirtyDaysAgo).length;

    const topRepos = [...own]
      .sort((a, b) => b.stargazers_count - a.stargazers_count || +new Date(b.pushed_at) - +new Date(a.pushed_at))
      .slice(0, 4)
      .map((r) => ({
        name: r.name,
        stars: r.stargazers_count,
        lang: r.language ?? "—",
        url: r.html_url,
      }));

    return {
      repos: own.length,
      stars,
      langs,
      recent,
      topRepos,
    };
  } catch {
    return FALLBACK;
  }
}

export default async function GitHubStats() {
  const s = await fetchStats();
  return (
    <section className="mb-16 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)]/45 overflow-hidden backdrop-blur">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-line)]">
        <span className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-fg-soft)] flex items-center gap-2">
          <GhMark />
          GitHub · pauti04
        </span>
        <a
          href="https://github.com/pauti04"
          target="_blank"
          rel="noreferrer"
          className="text-[0.74rem] text-[var(--color-muted)] hover:text-[var(--color-accent)] transition"
        >
          Live data · refreshes hourly →
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[var(--color-line)]">
        <Stat big={s.repos.toString()} label="Public repos" note="non-forks" />
        <Stat
          big={s.stars.toString()}
          label="Stars earned"
          note="across own repos"
        />
        <Stat
          big={s.recent.toString()}
          label="Active in 30d"
          note="repos with pushes"
        />
        <Stat
          big={s.langs[0] ?? "—"}
          label="Top language"
          note={s.langs.slice(1).join(" · ") || ""}
          textBig
        />
      </div>
      <div className="px-5 py-4 border-t border-[var(--color-line)]">
        <div className="text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted)] mb-2">
          Most recent / starred repos
        </div>
        <div className="flex flex-wrap gap-2">
          {s.topRepos.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 text-[0.82rem] px-3 py-1.5 rounded-md border border-[var(--color-line)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 transition"
            >
              <span className="text-[var(--color-fg)] group-hover:text-[var(--color-accent)]">
                {r.name}
              </span>
              <span className="text-[var(--color-muted)]">·</span>
              <span className="text-[var(--color-muted)] mono text-[0.74rem]">
                {r.lang}
              </span>
              {r.stars > 0 && (
                <>
                  <span className="text-[var(--color-muted)]">·</span>
                  <span className="text-[var(--color-accent)] mono text-[0.74rem]">
                    ★ {r.stars}
                  </span>
                </>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({
  big,
  label,
  note,
  textBig,
}: {
  big: string;
  label: string;
  note?: string;
  textBig?: boolean;
}) {
  return (
    <div className="p-5">
      <div
        className={`numeral !text-[var(--color-accent)] ${
          textBig ? "!text-[1.6rem] md:!text-[1.8rem]" : "!text-[2rem] md:!text-[2.2rem]"
        }`}
      >
        {big}
      </div>
      <div className="text-[0.86rem] mt-2 text-[var(--color-fg)] leading-snug">
        {label}
      </div>
      {note && (
        <div className="text-[0.74rem] mt-1 text-[var(--color-muted)] leading-relaxed">
          {note}
        </div>
      )}
    </div>
  );
}

function GhMark() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.36-1.3-1.72-1.3-1.72-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.71 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.47.11-3.07 0 0 .98-.31 3.2 1.18a11.07 11.07 0 0 1 5.83 0c2.22-1.5 3.2-1.18 3.2-1.18.63 1.6.23 2.77.11 3.07.74.81 1.19 1.84 1.19 3.1 0 4.44-2.7 5.41-5.27 5.7.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

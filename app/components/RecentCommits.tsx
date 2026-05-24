type Commit = {
  repo: string;
  sha: string;
  message: string;
  url: string;
  date: string;
};

type Repo = {
  name: string;
  fork: boolean;
  pushed_at: string;
  html_url: string;
};

type GhCommit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { date: string } };
};

const FALLBACK: Commit[] = [
  {
    repo: "netpulse",
    sha: "—",
    message: "longest-prefix-match index for RPKI validation",
    url: "https://github.com/pauti04/netpulse",
    date: new Date().toISOString(),
  },
  {
    repo: "bourse",
    sha: "—",
    message: "byte-exact WAL replay test under miri",
    url: "https://github.com/pauti04/bourse",
    date: new Date().toISOString(),
  },
  {
    repo: "CostDNA",
    sha: "—",
    message: "rolling-window cost attribution",
    url: "https://github.com/pauti04/CostDNA",
    date: new Date().toISOString(),
  },
];

async function fetchRecent(): Promise<Commit[]> {
  try {
    const reposRes = await fetch(
      "https://api.github.com/users/pauti04/repos?per_page=100&sort=pushed",
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      }
    );
    if (!reposRes.ok) return FALLBACK;
    const repos = ((await reposRes.json()) as Repo[])
      .filter((r) => !r.fork)
      .slice(0, 6);

    const commits: Commit[] = [];
    for (const r of repos) {
      try {
        const cRes = await fetch(
          `https://api.github.com/repos/pauti04/${r.name}/commits?per_page=2`,
          {
            headers: { Accept: "application/vnd.github+json" },
            next: { revalidate: 3600 },
          }
        );
        if (!cRes.ok) continue;
        const list = (await cRes.json()) as GhCommit[];
        for (const c of list) {
          commits.push({
            repo: r.name,
            sha: c.sha.slice(0, 7),
            message: (c.commit.message || "").split("\n")[0].slice(0, 88),
            url: c.html_url,
            date: c.commit.author?.date ?? r.pushed_at,
          });
        }
      } catch {}
    }
    commits.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    return commits.slice(0, 5);
  } catch {
    return FALLBACK;
  }
}

function relativeTime(iso: string): string {
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
  if (wk < 8) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  return `${mo}mo ago`;
}

export default async function RecentCommits() {
  const commits = await fetchRecent();
  return (
    <section className="my-10 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-soft)]/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-line)]">
        <span className="text-[0.7rem] text-[var(--color-fg-soft)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
          recently shipped
        </span>
        <span className="text-[0.66rem] text-[var(--color-muted)] italic">
          last 5 commits across my repos, refreshed hourly
        </span>
      </div>
      <ul className="divide-y divide-[var(--color-line)]">
        {commits.map((c) => (
          <li key={c.sha + c.repo}>
            <a
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="grid grid-cols-[auto_1fr_auto] items-baseline gap-3 px-5 py-2.5 hover:bg-[var(--color-bg-soft)]/60 transition group"
            >
              <span className="text-[0.76rem] mono text-[var(--color-accent)] tabular-nums shrink-0">
                {c.sha}
              </span>
              <span className="min-w-0">
                <span className="text-[var(--color-fg-soft)] text-[0.88rem] group-hover:text-[var(--color-fg)] transition">
                  {c.message}
                </span>
                <span className="text-[var(--color-muted)] text-[0.74rem] ml-2">
                  · {c.repo}
                </span>
              </span>
              <span className="text-[0.72rem] text-[var(--color-muted)] tabular-nums shrink-0">
                {relativeTime(c.date)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { byNewest } from "@/lib/writing";
import { social } from "@/lib/data";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Working notes from Parth — short technical writeups on systems, networking, and ML infrastructure.",
};

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  });
}

export default function WritingIndex() {
  const posts = byNewest();
  return (
    <main className="relative min-h-screen">
      <TopBar />
      <article className="relative mx-auto max-w-[760px] px-6 pt-28 pb-20">
        <nav className="mb-12 text-[0.84rem] text-[var(--color-muted)]">
          <Link
            href="/"
            className="hover:text-[var(--color-accent)] transition"
          >
            ← Back to portfolio
          </Link>
        </nav>

        <header className="mb-12">
          <div className="text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4 font-mono flex items-center gap-3">
            <span className="text-[var(--color-accent)]">Writing</span>
            <span className="w-6 h-px bg-[var(--color-line)]" />
            <span>Working notes</span>
            <a
              href="/feed.xml"
              className="ml-auto text-[var(--color-muted)] hover:text-[var(--color-accent)] transition flex items-center gap-1"
              aria-label="RSS feed"
            >
              <RssIcon /> RSS
            </a>
          </div>
          <h1 className="serif text-[2.6rem] md:text-[3.4rem] leading-[1] tracking-[-0.025em] font-semibold text-[var(--color-fg)]">
            Writing.
          </h1>
          <p className="text-[1.05rem] text-[var(--color-fg-soft)] italic mt-3 leading-snug max-w-[58ch]">
            Short technical writeups on the projects I&apos;m building — the
            decisions that mattered, the benchmarks, and the lessons I keep
            relearning.
          </p>
        </header>

        <ol className="space-y-1 border-t border-[var(--color-line)]">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={p.href}
                className="group block py-7 border-b border-[var(--color-line)]"
              >
                <div className="flex items-baseline gap-3 text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-muted)] mb-2 font-mono">
                  <span className="tabular-nums">{fmtDate(p.date)}</span>
                  <span className="w-5 h-px bg-[var(--color-line)]" />
                  <span>{p.minutes} min read</span>
                </div>
                <h2 className="serif text-[1.6rem] md:text-[1.9rem] leading-[1.1] tracking-[-0.018em] font-medium text-[var(--color-fg)] group-hover:text-[var(--color-accent)] transition">
                  {p.title}
                </h2>
                <p className="text-[0.98rem] leading-[1.7] text-[var(--color-fg-soft)] mt-3 max-w-[60ch]">
                  {p.summary}
                </p>
                <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                  {p.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                  <span className="ml-auto text-[0.84rem] text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition">
                    Read →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>

        <footer className="mt-16 pt-6 border-t border-[var(--color-line)] flex items-center justify-between text-[0.84rem] text-[var(--color-muted)]">
          <Link
            href="/"
            className="hover:text-[var(--color-accent)] transition"
          >
            ← Back to portfolio
          </Link>
          <span>
            <a href={`mailto:${social.email}`} className="link">
              {social.email}
            </a>
          </span>
        </footer>
      </article>
    </main>
  );
}

function TopBar() {
  return (
    <div className="fixed top-0 inset-x-0 z-30 backdrop-blur-xl bg-[var(--color-bg)]/70 border-b border-[var(--color-line)]/60">
      <div className="mx-auto max-w-[1180px] px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[0.96rem] text-[var(--color-fg)] font-medium tracking-tight hover:text-[var(--color-accent)] transition"
        >
          <span className="w-7 h-7 rounded-md bg-[var(--color-accent)] grid place-items-center text-[#0a0a0b] font-mono text-[0.8rem] font-semibold">
            P
          </span>
          Parth
          <span className="text-[0.78rem] text-[var(--color-muted)] hidden sm:inline">
            / pauti04
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/#work" className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition">
            Work
          </Link>
          <Link href="/cv" className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition hidden sm:inline">
            CV
          </Link>
          <a href={`mailto:${social.email}`} className="text-[0.86rem] text-[var(--color-bg)] bg-[var(--color-accent)] hover:bg-[#7db8ff] px-3 py-1.5 rounded-md font-medium transition ml-1">
            Get in touch →
          </a>
        </nav>
      </div>
    </div>
  );
}

function RssIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden>
      <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795 0 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-8.18v4.811c10.539.063 19.105 8.604 19.167 19.139h4.83c-.062-13.186-10.771-23.832-23.997-23.95z" />
    </svg>
  );
}

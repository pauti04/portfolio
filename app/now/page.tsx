import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Now — Parth · pauti04",
  description:
    "What I'm working on this week. A short, dated note in the spirit of nownownow.com.",
};

// Update this date when you change the page below.
const LAST_UPDATED = "2026-05-19";

export default function NowPage() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <div className="mx-auto max-w-[680px] px-6 pt-28 pb-20">
        <nav className="text-[0.82rem] text-[var(--color-muted)] mb-10">
          <Link href="/" className="hover:text-[var(--color-accent)] transition">
            ← Back to portfolio
          </Link>
        </nav>

        <header className="mb-10">
          <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4 mono">
            <span className="text-[var(--color-accent)]">now.md</span>
            <span className="w-6 h-px bg-[var(--color-line)]" />
            <span>this week, roughly</span>
            <span className="ml-auto tabular-nums">
              updated {new Date(LAST_UPDATED).toLocaleDateString("en-CA")}
            </span>
          </div>
          <h1 className="serif text-[2.4rem] md:text-[3.2rem] leading-[1] tracking-[-0.025em] text-[var(--color-fg)] font-semibold lowercase">
            now.
          </h1>
          <p className="text-[1.05rem] italic text-[var(--color-fg-soft)] mt-3 leading-snug max-w-[60ch]">
            a short, dated page. updated whenever something on it stops being
            true. inspired by{" "}
            <a
              href="https://nownownow.com/about"
              target="_blank"
              rel="noreferrer"
              className="link not-italic"
            >
              nownownow.com
            </a>
            .
          </p>
        </header>

        <hr className="border-[var(--color-line)] mb-10" />

        <article className="space-y-6 text-[1.02rem] leading-[1.78] text-[var(--color-fg-soft)]">
          <Section title="building">
            <p>
              Mostly heads-down on{" "}
              <Link href="/work/bourse" className="link not-italic">
                Bourse
              </Link>
              {" "}— specifically pushing the matching engine&apos;s p99 lower
              under sustained load. The current 24µs is in-browser; the native
              build does better and I want both numbers in the README.
            </p>
            <p>
              On{" "}
              <Link href="/work/netpulse" className="link not-italic">
                NetPulse
              </Link>
              , adding two more historical incidents to the benchmark corpus —
              Indosat 2014 and Telstra/AS4637 2017. Goal is to have five
              reproductions before I publish v1.
            </p>
          </Section>

          <Section title="reading">
            <p>
              Larry Harris&apos; <em>Trading and Exchanges</em> for the second
              time. Started{" "}
              <em>Network Algorithmics</em> by George Varghese — the chapter on
              longest-prefix-match data structures is what pushed me toward the
              patricia trie writeup.
            </p>
          </Section>

          <Section title="trying to get better at">
            <p>
              Writing CUDA kernels (slowly). Reading other people&apos;s code,
              specifically{" "}
              <a
                href="https://github.com/tikv/raft-rs"
                target="_blank"
                rel="noreferrer"
                className="link not-italic"
              >
                tikv/raft-rs
              </a>{" "}
              to see how production-grade Rust handles distributed state.
            </p>
          </Section>

          <Section title="job search">
            <p>
              Talking to a few teams for 2026 new-grad and internship roles.
              ML-infra and low-latency systems both interest me; I&apos;m biased
              toward the company over the role at this stage.
            </p>
          </Section>

          <Section title="not doing">
            <p>
              Side projects unrelated to the four already on this site. Saying
              yes to coffee chats where the recruiter hasn&apos;t read past
              the headline. Vibe-coding.
            </p>
          </Section>
        </article>

        <footer className="mt-14 pt-6 border-t border-[var(--color-line)] flex items-center justify-between text-[0.84rem] text-[var(--color-muted)]">
          <Link href="/" className="hover:text-[var(--color-accent)] transition">
            ← Back to portfolio
          </Link>
          <a href="mailto:nikunjbhadwa123@gmail.com" className="link">
            nikunjbhadwa123@gmail.com
          </a>
        </footer>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[0.74rem] uppercase tracking-[0.18em] text-[var(--color-accent)] mono mb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function TopBar() {
  return (
    <div className="fixed top-0 inset-x-0 z-30 backdrop-blur-xl bg-[var(--color-bg)]/80 border-b border-[var(--color-line)]">
      <div className="mx-auto max-w-[1180px] px-6 py-3.5 flex items-center justify-between">
        <Link
          href="/"
          className="serif text-[1.1rem] text-[var(--color-fg)] font-medium tracking-tight hover:text-[var(--color-accent)] transition flex items-baseline gap-2"
        >
          Parth<span className="text-[var(--color-accent)]">.</span>
          <span className="text-[0.78rem] text-[var(--color-muted)] hidden sm:inline font-sans">
            pauti04
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/#work"
            className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition"
          >
            Work
          </Link>
          <Link
            href="/writing"
            className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition hidden sm:inline"
          >
            Writing
          </Link>
          <Link
            href="/uses"
            className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition hidden md:inline"
          >
            Uses
          </Link>
          <a
            href="mailto:nikunjbhadwa123@gmail.com"
            className="text-[0.86rem] text-[var(--color-bg)] bg-[var(--color-accent)] hover:bg-[#7db8ff] px-3 py-1.5 rounded-md font-medium transition ml-1"
          >
            Get in touch →
          </a>
        </nav>
      </div>
    </div>
  );
}

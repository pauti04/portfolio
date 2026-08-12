import type { Metadata } from "next";
import Link from "next/link";
import ReadingProgress from "@/app/components/ReadingProgress";

export const metadata: Metadata = {
  title: "Fifteen green runs booked a meeting on a Sunday",
  description:
    "A live scheduling agent passed every tool-level check fifteen times in a row — and was wrong every time. What caught it, what didn't, and why pass rates lie.",
};

export default function Post() {
  return (
    <main className="min-h-screen">
      <ReadingProgress />
      <div className="mx-auto max-w-[720px] px-6 pt-24 pb-24">
        <nav className="text-[0.82rem] text-[var(--color-muted)] mb-10">
          <Link href="/" className="hover:text-[var(--color-accent)] transition">
            ← Back to portfolio
          </Link>
          <span className="mx-2">·</span>
          <span>Writing</span>
        </nav>

        <header>
          <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-5">
            <span className="text-[var(--color-accent)]">No. 02</span>
            <span className="w-6 h-px bg-[var(--color-line)]" />
            <span>Working notes · Reflight</span>
            <span className="ml-auto tabular-nums">2026 · 6 min read</span>
          </div>
          <h1 className="serif text-[2.4rem] md:text-[3.2rem] leading-[1.02] tracking-[-0.025em] font-semibold text-[var(--color-fg)]">
            Fifteen green runs booked a meeting on a{" "}
            <span className="text-[var(--color-accent)]">Sunday</span>.
          </h1>
          <p className="text-[1.1rem] italic text-[var(--color-fg-soft)] mt-3 leading-snug">
            A live agent passed every tool-level check, fifteen times in a row
            — and was wrong every single time. Pass rates lied. The recordings
            didn&apos;t.
          </p>
        </header>

        <hr className="my-10 border-[var(--color-line)]" />

        <article className="space-y-6 text-[1rem] leading-[1.75] text-[var(--color-fg-soft)]">
          <p>
            <span className="serif text-[2.6rem] leading-[0.85] float-left mr-2 mt-1 text-[var(--color-accent)] font-medium">
              E
            </span>
            verything below actually happened, against a live API, on July 10,
            2026. The recordings are committed to the{" "}
            <a
              href="https://github.com/pauti04/reflight"
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              Reflight repo
            </a>{" "}
            — every run in this post replays offline, byte-identical, for
            $0.00.
          </p>

          <p>
            The setup: a scheduling agent (gpt-4o-mini, function calling) with
            three tools — <code className="mono text-[0.92em] text-[var(--color-fg)]">get_today</code>,{" "}
            <code className="mono text-[0.92em] text-[var(--color-fg)]">check_availability</code>,{" "}
            <code className="mono text-[0.92em] text-[var(--color-fg)]">book_meeting</code> — and one
            honest task: book a 45-minute design sync <em>next Wednesday at
            3:30pm</em>, and if that slot conflicts, take the next free slot
            that afternoon. The calendar fixture anchors &ldquo;today&rdquo; at
            Friday, July 10 — so next Wednesday is the 15th, the requested
            15:30 conflicts, and the only correct answer is 17:15.
          </p>

          <p>
            I ran it five times through Reflight&apos;s N-run executor. Then,
            because the result was hard to believe, ten more. Total spend for
            fifteen live runs: under a cent.
          </p>

          <h2 className="serif text-[1.6rem] font-semibold text-[var(--color-fg)] mt-12 mb-2">
            What happened
          </h2>

          <p>
            <span className="text-[var(--color-fg)]">
              Fifteen out of fifteen runs booked July 12 — a Sunday — at
              15:30, and confirmed it to the user as &ldquo;Wednesday, July
              12th.&rdquo;
            </span>{" "}
            The recorded transcript makes the failure exact. The agent{" "}
            <em>did</em> call <code className="mono text-[0.92em] text-[var(--color-fg)]">get_today</code>{" "}
            first, <em>did</em> receive the correct date — and computed
            &ldquo;next Wednesday&rdquo; as July 12 anyway:
          </p>

          <pre className="artifact text-[0.78rem] my-5 overflow-x-auto">
            <span className="c-muted">TOOL </span>
            <span className="c-fg">get_today {"{}"} → {"{"}date: 2026-07-10, weekday: Friday{"}"}</span>
            {"\n"}
            <span className="c-muted">TOOL </span>
            <span className="c-fg">check_availability {"{"}date: </span>
            <span className="c-rose">2026-07-12</span>
            <span className="c-fg">, start: 15:30{"}"} → available</span>
            <span className="c-muted">  (empty day)</span>
            {"\n"}
            <span className="c-muted">TOOL </span>
            <span className="c-fg">book_meeting {"{"}date: </span>
            <span className="c-rose">2026-07-12</span>
            <span className="c-fg">, start: 15:30{"}"} → booked</span>
            {"\n"}
            <span className="c-muted">LLM  </span>
            <span className="c-fg">&quot;…successfully booked for </span>
            <span className="c-rose">Wednesday, July 12th</span>
            <span className="c-fg"> at 15:30.&quot;</span>
          </pre>

          <p>
            Here is the uncomfortable part:{" "}
            <span className="text-[var(--color-fg)]">
              every tool-level check passed.
            </span>{" "}
            The wrong day has an empty calendar, so availability said yes. The
            booking succeeded. No tool errored, no loop, no crash. The rule
            classifiers — correctly — found nothing. Fifteen green verdicts,
            100% pass rate, one distinct answer. The agent isn&apos;t flaky.
            It is <em>consistently, confidently wrong</em>, which no amount of
            retry-and-compare can surface.
          </p>

          <h2 className="serif text-[1.6rem] font-semibold text-[var(--color-fg)] mt-12 mb-2">
            What caught it — and what almost didn&apos;t
          </h2>

          <p>
            Two layers, both run on the recordings after the fact — no
            re-execution, no additional agent spend.
          </p>

          <p>
            <span className="text-[var(--color-fg)]">The LLM judge</span>{" "}
            (gpt-4o-mini judging itself) read the transcripts and flagged the
            failure at 0.90 confidence — &ldquo;the agent incorrectly stated
            the date of the meeting as Wednesday, July 12, 2026, when it is
            actually a Sunday.&rdquo; Impressive. Except across three batches
            of the same failure, the same judge caught{" "}
            <span className="mono text-[var(--color-fg)]">5 of 5</span>, then{" "}
            <span className="mono text-[var(--color-fg)]">3 of 5</span>, then{" "}
            <span className="mono text-[var(--color-rose)]">1 of 5</span>. A
            judge is a probabilistic net — cheap, useful, and exactly as
            nondeterministic as the agents it judges. Measuring that variance
            took thirty seconds precisely <em>because</em> the runs were
            recordings: re-judging is free re-reading, not re-running.
          </p>

          <p>
            <span className="text-[var(--color-fg)]">
              A deterministic assertion
            </span>{" "}
            — fifteen lines of Python that read each recording and check the
            booked slot against ground truth — caught{" "}
            <span className="mono text-[var(--color-emerald)]">
              every run in every batch
            </span>
            , and folded the verdicts under one shared failure signature:{" "}
            <code className="mono text-[0.92em] text-[var(--color-fg)]">wrong_slot ×15</code>, same
            bug, every run. Encode ground truth once, and every future
            recording — CI runs included — gets checked against it for $0.00.
          </p>

          <h2 className="serif text-[1.6rem] font-semibold text-[var(--color-fg)] mt-12 mb-2">
            Why this needed a flight recorder
          </h2>

          <ol className="my-5 space-y-3 text-[0.96rem] leading-[1.7] list-decimal list-outside ml-5 marker:text-[var(--color-muted)]">
            <li>
              <span className="text-[var(--color-fg)]">
                The failure would otherwise be a support ticket.
              </span>{" "}
              &ldquo;Agent booked the wrong day,&rdquo; from a user, days
              later, with nothing to inspect. Instead it&apos;s fifteen
              committed recordings that reproduce the exact moment, offline,
              with the network hard-blocked.
            </li>
            <li>
              <span className="text-[var(--color-fg)]">
                Pass rates lied; the recording didn&apos;t.
              </span>{" "}
              Every metric short of reading the transcript said this agent
              works. The transcript is the only place the bug exists — which
              is an argument for keeping every transcript.
            </li>
            <li>
              <span className="text-[var(--color-fg)]">
                Recurrence turned fifteen anecdotes into one bug.
              </span>{" "}
              A shared fingerprint groups every run under a single finding.
              One defect, not fifteen incidents.
            </li>
          </ol>

          <p>
            The layering is the actual thesis of Reflight: the judge and the
            assertion are both just <em>consumers of the same recording</em>.
            An open, replayable format is the substrate; detectors, evals,
            and regression tests are things you run on top of it — as many
            times as you like, for free.
          </p>

          <h2 className="serif text-[1.6rem] font-semibold text-[var(--color-fg)] mt-12 mb-2">
            Footnote: what the microscope caught in itself
          </h2>

          <p>
            Running this study also surfaced two real bugs in Reflight: the
            pricing table had no OpenAI models, and cost computation
            didn&apos;t read OpenAI&apos;s usage keys — so the first batch of
            live runs ingested at $0.0000. Both fixed in the same commit. A
            case study that finds bugs in the microscope too is a good day.
          </p>

          <hr className="my-10 border-[var(--color-line)]" />

          <p className="text-[0.92rem] text-[var(--color-muted)] italic">
            Reflight is open source at{" "}
            <a
              href="https://github.com/pauti04/reflight"
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              github.com/pauti04/reflight
            </a>
            , with the full case study, recordings, and the 15-line assertion
            in the repo. The{" "}
            <a
              href="https://pauti04.github.io/reflight-demo/"
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              hosted demo
            </a>{" "}
            replays real recorded runs in your browser.
          </p>
        </article>

        <footer className="mt-16 pt-6 border-t border-[var(--color-line)] flex items-center justify-between text-[0.82rem] text-[var(--color-muted)]">
          <Link href="/" className="hover:text-[var(--color-accent)] transition">
            ← Back to portfolio
          </Link>
          <span>
            Reach me at{" "}
            <a href="mailto:parth.auti@gmail.com" className="link">
              parth.auti@gmail.com
            </a>
          </span>
        </footer>
      </div>
    </main>
  );
}

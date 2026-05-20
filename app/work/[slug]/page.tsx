import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, social } from "@/lib/data";
import { PROJECT_PAGES } from "@/lib/project-pages";
import { POSTS } from "@/lib/writing";

import BourseDemo from "@/app/components/BourseDemo";
import NetPulseDemo from "@/app/components/NetPulseDemo";
import ChainCheckDemo from "@/app/components/ChainCheckDemo";
import CostDNADemo from "@/app/components/CostDNADemo";
import ChainCheckActionDemo from "@/app/components/ChainCheckActionDemo";
import RasoiBotDemo from "@/app/components/RasoiBotDemo";
import CodeBlock, {
  BOURSE_SNIPPET,
  NETPULSE_SNIPPET,
} from "@/app/components/CodeBlock";

const DEMOS: Record<string, React.ComponentType> = {
  netpulse: NetPulseDemo,
  bourse: BourseDemo,
  costdna: CostDNADemo,
  chaincheck: ChainCheckDemo,
  "chaincheck-action": ChainCheckActionDemo,
  rasoibot: RasoiBotDemo,
};

const CODE: Record<
  string,
  { lang: string; file: string; lines: typeof BOURSE_SNIPPET; caption: string }
> = {
  bourse: {
    lang: "Rust",
    file: "src/matcher.rs",
    lines: BOURSE_SNIPPET,
    caption:
      "The hot loop. One thread owns the gateway queue, one owns the matcher — no locks on the path.",
  },
  netpulse: {
    lang: "Python",
    file: "netpulse/rpki.py",
    lines: NETPULSE_SNIPPET,
    caption:
      "A patricia trie of authorized prefixes turns RPKI validation from a 43 ms scan into a 43 µs lookup.",
  },
};

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.artifact }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const p = projects.find((x) => x.artifact === slug);
  if (!p) return { title: "Not found" };
  return {
    title: `${p.name} — ${p.tagline}`,
    description: p.blurb.slice(0, 160),
    openGraph: {
      title: `${p.name} — ${p.tagline}`,
      description: p.blurb.slice(0, 160),
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name} — ${p.tagline}`,
      description: p.blurb.slice(0, 160),
    },
  };
}

export default async function ProjectPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const project = projects.find((p) => p.artifact === slug);
  const deep = PROJECT_PAGES[slug];
  if (!project || !deep) return notFound();

  const Demo = DEMOS[slug];
  const related = projects.filter((p) => p.artifact !== slug);
  const writeup = POSTS.find((w) =>
    w.tags.some((t) => t.toLowerCase() === project.name.toLowerCase())
  );
  const code = CODE[slug];

  return (
    <main className="relative min-h-screen">
      <TopBar />
      <article className="relative mx-auto max-w-[820px] px-6 pt-28 pb-24">
        <nav className="mb-12 text-[0.84rem] text-[var(--color-muted)]">
          <Link
            href="/"
            className="hover:text-[var(--color-accent)] transition"
          >
            ← Back to portfolio
          </Link>
          <span className="mx-2">·</span>
          <span>Work</span>
          <span className="mx-2">·</span>
          <span className="text-[var(--color-fg-soft)]">{project.name}</span>
        </nav>

        <header>
          <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4">
            <span className="text-[var(--color-accent)] tabular-nums">
              No. {project.index}
            </span>
            <span className="w-6 h-px bg-[var(--color-line)]" />
            <span>{project.tagline}</span>
            <span className="ml-auto tabular-nums">{project.year}</span>
          </div>

          <h1 className="serif text-[3rem] md:text-[4rem] leading-[1] tracking-[-0.025em] font-semibold text-[var(--color-fg)]">
            {project.name}
          </h1>
          <p className="text-[1.15rem] text-[var(--color-fg-soft)] italic mt-3 leading-snug max-w-[58ch]">
            {project.tagline}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Source <span aria-hidden>↗</span>
            </a>
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                Live deploy <span aria-hidden>↗</span>
              </a>
            )}
            <a href="#demo" className="btn btn-ghost">
              See the demo ↓
            </a>
          </div>

          <div className="mt-7 flex flex-wrap gap-1.5">
            {project.stack.split(" · ").map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        </header>

        <hr className="my-12 border-[var(--color-line)]" />

        <Section eyebrow="01 · Why this exists">
          <div className="space-y-5 text-[1rem] leading-[1.78] text-[var(--color-fg-soft)] max-w-[64ch]">
            {deep.whyExists.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Section>

        <Section eyebrow="02 · Architecture">
          <p className="text-[1rem] leading-[1.78] text-[var(--color-fg-soft)] max-w-[64ch]">
            {deep.architecture}
          </p>
        </Section>

        <Section eyebrow="03 · The demo" id="demo">
          <p className="text-[0.94rem] text-[var(--color-muted)] mb-4 max-w-[60ch]">
            Live in your browser — not a screenshot.
          </p>
          <Demo />
        </Section>

        <Section eyebrow="04 · Benchmarks">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-7 gap-x-6 mb-7">
            {deep.benchmarks.map((b) => (
              <div
                key={b.label}
                className="border-l border-[var(--color-line)] pl-4"
              >
                <div className="numeral !text-[1.8rem] md:!text-[2rem] text-[var(--color-accent)]">
                  {b.label}
                </div>
                <div className="text-[0.86rem] mt-2 text-[var(--color-fg)]">
                  {b.value}
                </div>
                <div className="text-[0.74rem] mt-1 text-[var(--color-muted)] leading-relaxed">
                  {b.note}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[0.94rem] leading-[1.7] text-[var(--color-fg-soft)] max-w-[64ch] italic">
            {deep.benchmarkMethod}
          </p>
        </Section>

        {code && (
          <Section eyebrow="05 · Code">
            <CodeBlock
              lang={code.lang}
              file={code.file}
              lines={code.lines}
              caption={code.caption}
            />
          </Section>
        )}

        <Section eyebrow="06 · What I learned">
          <ul className="space-y-5 max-w-[64ch]">
            {deep.lessons.map((l, i) => (
              <li
                key={i}
                className="flex gap-4 text-[1rem] leading-[1.7] text-[var(--color-fg-soft)]"
              >
                <span className="text-[var(--color-accent)] tabular-nums shrink-0 mt-[2px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className="text-[var(--color-fg)] font-medium">
                    {l.title}
                  </span>{" "}
                  {l.body}
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section eyebrow="07 · What's next">
          <p className="text-[1rem] leading-[1.78] text-[var(--color-fg-soft)] max-w-[64ch]">
            {deep.whatsNext}
          </p>
        </Section>

        {writeup && (
          <Section eyebrow="Further reading">
            <Link
              href={writeup.href}
              className="group flex items-center justify-between gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-soft)]/55 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 px-5 py-4 transition"
            >
              <div className="min-w-0">
                <div className="text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted)] mb-0.5">
                  Writeup · {writeup.minutes} min read
                </div>
                <div className="text-[1rem] text-[var(--color-fg)] group-hover:text-[var(--color-accent)] transition">
                  {writeup.title}
                </div>
              </div>
              <span className="text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition shrink-0">
                Read →
              </span>
            </Link>
          </Section>
        )}

        <Section eyebrow="More work">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {related.map((p) => (
              <Link
                key={p.artifact}
                href={`/work/${p.artifact}`}
                className="group rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-soft)]/55 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 px-4 py-4 transition"
              >
                <div className="text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted)] mb-1">
                  No. {p.index} · {p.year}
                </div>
                <div className="serif text-[1.1rem] font-medium text-[var(--color-fg)] group-hover:text-[var(--color-accent)] transition">
                  {p.name}
                </div>
                <div className="text-[0.84rem] text-[var(--color-muted)] mt-1 leading-snug">
                  {p.tagline}
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <footer className="mt-16 pt-6 border-t border-[var(--color-line)] flex items-center justify-between text-[0.84rem] text-[var(--color-muted)]">
          <Link
            href="/"
            className="hover:text-[var(--color-accent)] transition"
          >
            ← Back to portfolio
          </Link>
          <span>
            Build something together? <a href={`mailto:${social.email}`} className="link">say hi</a>
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
            All work
          </Link>
          <Link href="/writing" className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition">
            Writing
          </Link>
          <Link href="/cv" className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition hidden sm:inline">
            CV
          </Link>
        </nav>
      </div>
    </div>
  );
}

function Section({
  eyebrow,
  id,
  children,
}: {
  eyebrow: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-10 border-t border-[var(--color-line)]">
      <div className="text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-5 font-mono">
        {eyebrow}
      </div>
      {children}
    </section>
  );
}

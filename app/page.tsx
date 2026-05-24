import Link from "next/link";
import { projects, numbers, skills, social } from "@/lib/data";
import { POSTS } from "@/lib/writing";
import BourseDemo from "./components/BourseDemo";
import NetPulseDemo from "./components/NetPulseDemo";
import ChainCheckDemo from "./components/ChainCheckDemo";
import CostDNADemo from "./components/CostDNADemo";
import ChainCheckActionDemo from "./components/ChainCheckActionDemo";
import RasoiBotDemo from "./components/RasoiBotDemo";
import CommandBar from "./components/CommandBar";
import CodeBlock, {
  BOURSE_SNIPPET,
  NETPULSE_SNIPPET,
} from "./components/CodeBlock";
import LazyDemo from "./components/LazyDemo";
import GitHubStats from "./components/GitHubStats";
import RecentCommits from "./components/RecentCommits";
import MarginNote from "./components/MarginNote";

const DEMOS: Record<string, React.ComponentType> = {
  netpulse: NetPulseDemo,
  bourse: BourseDemo,
  costdna: CostDNADemo,
  chaincheck: ChainCheckDemo,
  "chaincheck-action": ChainCheckActionDemo,
  rasoibot: RasoiBotDemo,
};

const WRITEUP: Record<string, { title: string; href: string; minutes: number }> =
  Object.fromEntries(
    POSTS.flatMap((p) => {
      const project = p.tags.find((t) => /^[A-Z]/.test(t))?.toLowerCase();
      if (!project) return [];
      const map: Record<string, string> = {
        netpulse: "netpulse",
        bourse: "bourse",
        costdna: "costdna",
        chaincheck: "chaincheck",
      };
      const slug = map[project];
      if (!slug) return [];
      return [[slug, { title: p.title, href: p.href, minutes: p.minutes }] as const];
    })
  );

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

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <TopBar />
      <div className="relative mx-auto max-w-[920px] px-5 sm:px-6 pt-28 pb-20">
        <Hero />
        <Highlights />
        <GitHubStats />
        <RecentCommits />
        <Work />
        <About />
        <Contact />
        <Footer />
      </div>
      <CommandBar />
    </main>
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
          <a
            href="#work"
            className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition"
          >
            Work
          </a>
          <Link
            href="/writing"
            className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition hidden sm:inline"
          >
            Writing
          </Link>
          <Link
            href="/cv"
            target="_blank"
            className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition hidden sm:inline"
          >
            CV
          </Link>
          <Link
            href="/uses"
            className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition hidden md:inline"
          >
            Uses
          </Link>
          <a
            href={`mailto:${social.email}`}
            className="text-[0.86rem] text-[var(--color-bg)] bg-[var(--color-accent)] hover:bg-[#7db8ff] px-3 py-1.5 rounded-md font-medium transition ml-1"
          >
            Get in touch →
          </a>
        </nav>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="cover" className="pt-12 pb-20 md:pt-16 md:pb-24">
      <div className="eyebrow fade-in">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
        </span>
        looking for 2026 grad / internship roles
      </div>

      <h1 className="serif text-[3rem] md:text-[4.4rem] leading-[1.02] tracking-[-0.025em] text-[var(--color-fg)] mt-6 fade-in d-1 font-semibold lowercase">
        hi, i&apos;m parth.
        <br />
        <span className="text-[var(--color-accent)]">i build small things and try to break them.</span>
      </h1>

      <p className="text-[1.02rem] md:text-[1.12rem] leading-[1.65] text-[var(--color-fg-soft)] mt-7 max-w-[58ch] fade-in d-2">
        CS undergrad. mostly write Rust and Python; some TypeScript I usually
        regret later. spend my weekends on a low-latency matching engine, a BGP
        hijack detector that finally caught a real one last month, and a GNN
        that thinks it understands my AWS bill.
      </p>

      <p className="text-[0.92rem] text-[var(--color-muted)] mt-4 fade-in d-2 leading-relaxed">
        looking for a place to keep doing this in 2026 — new-grad SWE or
        ML-infra. remote works, relocating works. email is the fastest way to
        reach me.
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-3 fade-in d-3">
        <a href={`mailto:${social.email}`} className="btn btn-primary">
          say hi
          <span aria-hidden>→</span>
        </a>
        <Link href="/cv" target="_blank" className="btn btn-ghost">
          CV
          <span aria-hidden>↗</span>
        </Link>
        <a href="#work" className="btn btn-ghost">
          see the work
        </a>
      </div>

      <div className="mt-14 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 fade-in d-4">
        {numbers.map((n) => (
          <div key={n.label}>
            <div className="numeral">{n.value}</div>
            <div className="text-[0.86rem] mt-2.5 text-[var(--color-fg)]">
              {n.label}
            </div>
            <div className="text-[0.74rem] mt-1 text-[var(--color-muted)] leading-relaxed">
              {n.note}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[0.78rem] text-[var(--color-muted)] italic max-w-[58ch] fade-in d-4">
        numbers from{" "}
        <a href="https://github.com/pauti04/netpulse/blob/main/BENCHMARK.md" target="_blank" rel="noreferrer" className="link">
          NetPulse&apos;s benchmark doc
        </a>
        . the matching-engine one you can stress-test yourself further down.
      </p>
    </section>
  );
}

const ASK_BULLETS = [
  "new-grad SWE or ML-infra, 2026 start",
  "remote or relocate, either works",
  "strongest in Rust, Python; comfy with TS, some C",
  "free to interview from June 2026 onward",
];

function Highlights() {
  return (
    <section className="mb-14 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg-soft)]/40 p-5">
      <div className="text-[0.78rem] text-[var(--color-fg-soft)] mb-3">
        what I&apos;m looking for
      </div>
      <ul className="space-y-1.5">
        {ASK_BULLETS.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2.5 text-[0.92rem] text-[var(--color-fg-soft)] leading-snug"
          >
            <span className="text-[var(--color-accent)] mt-[3px]">→</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--color-line)] text-[0.84rem]">
        <a
          href={`mailto:${social.email}`}
          className="text-[var(--color-accent)] hover:underline"
        >
          say hi →
        </a>
        <span className="text-[var(--color-muted)]">·</span>
        <Link
          href="/cv"
          target="_blank"
          className="text-[var(--color-fg-soft)] hover:text-[var(--color-fg)]"
        >
          CV ↗
        </Link>
        <span className="text-[var(--color-muted)]">·</span>
        <a
          href={social.github}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--color-fg-soft)] hover:text-[var(--color-fg)]"
        >
          GitHub
        </a>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="pt-20 pb-12 border-t border-[var(--color-line)]">
      <SectionLabel n="01" title="things I've built" />
      <p className="text-[0.98rem] leading-[1.7] text-[var(--color-fg-soft)] max-w-[58ch] mt-5 mb-16">
        Six projects, each followed by something that actually runs in your
        browser. the matching engine matches. the BGP detector is connected to
        ris-live right now. nothing here is a screenshot — poke at it.
      </p>

      <div className="space-y-24">
        {projects.map((p) => {
          const Demo = DEMOS[p.artifact];
          return (
            <article key={p.name} id={`card-${p.artifact}`} className="fade-in">
              <header>
                <div className="flex items-baseline gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-muted)] font-mono mb-3">
                  <span className="text-[var(--color-accent)] tabular-nums">
                    No. {p.index}
                  </span>
                  <span className="w-5 h-px bg-[var(--color-line)]" />
                  <Link
                    href={`/work/${p.artifact}`}
                    className="text-[var(--color-accent)] hover:underline"
                  >
                    Live demo + deep dive →
                  </Link>
                  <span className="ml-auto tabular-nums">{p.year}</span>
                </div>
                <h3 className="serif text-[2rem] md:text-[2.4rem] leading-[1.04] tracking-[-0.022em] text-[var(--color-fg)] font-semibold">
                  <Link
                    href={`/work/${p.artifact}`}
                    className="hover:text-[var(--color-accent)] transition"
                  >
                    {p.name}
                  </Link>
                </h3>
                <p className="serif italic text-[1.05rem] text-[var(--color-fg-soft)] mt-1">
                  {p.tagline}
                </p>
              </header>

              <p className="text-[0.98rem] leading-[1.78] text-[var(--color-fg-soft)] mt-6 max-w-[62ch]">
                {p.blurb}
                {NOTES[p.artifact]?.map((note, i) => (
                  <span key={i}>
                    {" "}
                    <MarginNote n={i + 1}>{note}</MarginNote>
                  </span>
                ))}
              </p>

              <div className="mt-7">
                <LazyDemo label={`${p.name} live demo`}>
                  <Demo />
                </LazyDemo>
              </div>

              {CODE[p.artifact] && (
                <CodeBlock
                  lang={CODE[p.artifact].lang}
                  file={CODE[p.artifact].file}
                  lines={CODE[p.artifact].lines}
                  caption={CODE[p.artifact].caption}
                />
              )}

              {WRITEUP[p.artifact] && (
                <Link
                  href={WRITEUP[p.artifact].href}
                  className="mt-5 group flex items-center justify-between gap-4 rounded-xl border border-[var(--color-line)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 px-5 py-4 transition"
                >
                  <div className="min-w-0">
                    <div className="text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted)] mb-0.5 flex items-center gap-2 font-mono">
                      <span>Writeup</span>
                      <span className="w-4 h-px bg-[var(--color-line)]" />
                      <span className="text-[var(--color-fg-soft)]">
                        {WRITEUP[p.artifact].minutes} min read
                      </span>
                    </div>
                    <div className="text-[0.96rem] text-[var(--color-fg)] group-hover:text-[var(--color-accent)] transition">
                      {WRITEUP[p.artifact].title}
                    </div>
                  </div>
                  <span className="text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition shrink-0">
                    Read →
                  </span>
                </Link>
              )}

              <footer className="mt-7 pt-5 border-t border-[var(--color-line)] flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.split(" · ").map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-5 text-[0.9rem]">
                  <Link
                    href={`/work/${p.artifact}`}
                    className="text-[var(--color-fg)] hover:text-[var(--color-accent)] transition font-medium"
                  >
                    Deep dive →
                  </Link>
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-fg-soft)] hover:text-[var(--color-accent)] transition"
                  >
                    Source <span className="text-[var(--color-muted)]">↗</span>
                  </a>
                  {p.demo && (
                    <a
                      href={p.demo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-fg-soft)] hover:text-[var(--color-accent)] transition"
                    >
                      Live <span className="text-[var(--color-muted)]">↗</span>
                    </a>
                  )}
                </div>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="pt-20 pb-12 border-t border-[var(--color-line)]">
      <SectionLabel n="02" title="about me" />
      <div className="grid md:grid-cols-[1fr_260px] gap-x-10 gap-y-8 mt-8">
        <div className="space-y-5 text-[1.02rem] leading-[1.78] text-[var(--color-fg-soft)] max-w-[58ch]">
          <p>
            I like the spot where low-level systems meet ML. mostly because
            it&apos;s the spot where you can actually <em>measure</em> if the
            thing worked — byte-exact replay, real archived data, tail
            latencies that don&apos;t fall apart when you stress-test them.
            half my projects exist because I wanted to test a property like
            that.
          </p>
          <p>
            outside of code I read way too much about market microstructure
            and BGP, which sounds boring to most people and I&apos;m okay
            with that. I also cook a lot of Indian food — RasoiBot exists
            because I kept rewriting the same paneer recipe in my head every
            time someone asked.
          </p>

          <div className="mt-7 pt-6 border-t border-[var(--color-line)]">
            <div className="text-[0.78rem] text-[var(--color-fg-soft)] mb-3 italic">
              stuff I&apos;m bad at (being honest)
            </div>
            <ul className="space-y-2.5 text-[0.94rem] leading-snug">
              <li className="flex items-start gap-2.5">
                <span className="text-[var(--color-accent)] mt-[3px]">○</span>
                <span>
                  <span className="text-[var(--color-fg)]">GPU stuff.</span>{" "}
                  <span className="text-[var(--color-fg-soft)]">
                    I&apos;ve written maybe 200 lines of WGSL ever. want to fix
                    that — probably by writing a CUDA kernel for the GNN
                    inference path in CostDNA.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[var(--color-accent)] mt-[3px]">○</span>
                <span>
                  <span className="text-[var(--color-fg)]">distributed systems at real scale.</span>{" "}
                  <span className="text-[var(--color-fg-soft)]">
                    I&apos;ve read Raft, watched the videos. haven&apos;t
                    actually shipped a multi-node thing that survived a real
                    network partition. on the list.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[var(--color-accent)] mt-[3px]">○</span>
                <span>
                  <span className="text-[var(--color-fg)]">prod observability.</span>{" "}
                  <span className="text-[var(--color-fg-soft)]">
                    every demo here has a stats panel, but I&apos;ve never had
                    to keep a real Prometheus stack alive at 3am. curious what
                    that&apos;s actually like.
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>
        <aside className="md:border-l md:border-[var(--color-line)] md:pl-5 space-y-4 text-[0.86rem]">
          {skills.map((s) => (
            <div key={s.group}>
              <div className="text-[0.66rem] uppercase tracking-[0.18em] text-[var(--color-muted)] mb-1.5 font-mono">
                {s.group}
              </div>
              <div className="text-[var(--color-fg-soft)] leading-[1.55]">
                {s.items}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section
      id="contact"
      className="my-20 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg-soft)]/60 p-9 md:p-12"
    >
      <SectionLabel n="03" title="say hi" />
      <h2 className="serif text-[2.1rem] md:text-[2.8rem] leading-[1.05] tracking-[-0.022em] text-[var(--color-fg)] font-semibold mt-7 max-w-[22ch] lowercase">
        building something where systems and ML meet?{" "}
        <span className="text-[var(--color-accent)]">let&apos;s talk.</span>
      </h2>
      <p className="text-[1rem] leading-[1.7] text-[var(--color-fg-soft)] mt-5 max-w-[56ch]">
        I&apos;m looking for new-grad and internship roles for 2026.
        performance work, ML for infra, LLM tooling — happy to talk about any
        of it. email&apos;s easiest, but the command palette has a shortcut
        if you&apos;re feeling fancy.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a href={`mailto:${social.email}`} className="btn btn-primary">
          email me <span aria-hidden>→</span>
        </a>
        <Link href="/cv" target="_blank" className="btn btn-ghost">
          CV ↗
        </Link>
        <a href="/contact.vcf" download className="btn btn-ghost">
          save contact (.vcf)
        </a>
        <a
          href={social.github}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost"
        >
          github.com/pauti04
        </a>
      </div>
      <p className="mt-7 text-[0.84rem] text-[var(--color-muted)] italic max-w-[52ch]">
        ps — if you&apos;re hiring and made it this far down the page, that&apos;s
        already a better signal than any cold-recruit email I&apos;ve ever sent.
        thank you for reading.
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="pt-10 border-t border-[var(--color-line)] grid md:grid-cols-3 gap-6 text-[0.84rem] text-[var(--color-muted)] leading-relaxed">
      <div>
        <div className="text-[0.78rem] mb-2 text-[var(--color-fg-soft)] italic">
          built with
        </div>
        <p>
          Next.js, Tailwind, Geist. demos are TypeScript with one (NetPulse)
          wired to a real WebSocket. nothing here is a screenshot.
        </p>
      </div>
      <div>
        <div className="text-[0.78rem] mb-2 text-[var(--color-fg-soft)] italic">
          find me
        </div>
        <p>
          <a href={`mailto:${social.email}`} className="link">
            {social.email}
          </a>
          <br />
          <a href={social.github} target="_blank" rel="noreferrer" className="link">
            github.com/pauti04
          </a>
          <br />
          <Link href="/writing" className="link">
            all writing →
          </Link>{" "}
          <a
            href="/feed.xml"
            aria-label="RSS feed"
            className="inline-block px-2 py-1 -mx-1 text-[var(--color-muted)] hover:text-[var(--color-accent)] transition"
          >
            (rss)
          </a>
          <br />
          <Link href="/uses" className="link">
            /uses →
          </Link>{" "}
          <a href="/contact.vcf" download className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition">
            (vcard)
          </a>
        </p>
      </div>
      <div>
        <div className="text-[0.78rem] mb-2 text-[var(--color-fg-soft)] italic">
          shortcut
        </div>
        <p>
          press <span className="kbd">⌘K</span> for the command palette. it
          can do most things on this page.
        </p>
      </div>
    </footer>
  );
}

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="text-[0.78rem] tabular-nums text-[var(--color-accent)] font-mono">
        {n}.
      </span>
      <h2 className="serif text-[1.55rem] md:text-[1.75rem] text-[var(--color-fg)] tracking-[-0.012em] font-medium">
        {title}
      </h2>
      <span className="flex-1 h-px bg-[var(--color-line)] translate-y-[-3px]" />
    </div>
  );
}

const NOTES: Record<string, React.ReactNode[]> = {
  netpulse: [
    <>The 500× came from replacing a linear sweep with a longest-prefix-match trie indexed by network bits. Without it, the detector spent more time validating than collecting.</>,
    <>Real RIPE RIS announcements are messy: withdrawals, route flaps, MOAS that aren&apos;t actually hijacks. The verdict ensemble exists because no single signal survives the noise.</>,
  ],
  bourse: [
    <>SPSC because there&apos;s exactly one gateway thread and one matcher thread. Anything else would need locks I didn&apos;t want on the hot path.</>,
    <>WAL replay is byte-exact in the sense that the post-replay book state is bit-identical to the pre-crash snapshot. Miri caught two UB cases in early drafts.</>,
  ],
  costdna: [
    <>GraphSAGE because the call graph keeps growing — new lambdas, new instance types — and the model has to generalize to nodes it hasn&apos;t seen.</>,
  ],
  chaincheck: [
    <>Five detectors, not one, because each fails in a different way. The ensemble is the point.</>,
  ],
};

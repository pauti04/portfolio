import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Uses — Parth · pauti04",
  description:
    "What I write code in. Editor, terminal, fonts, hosting, dotfiles, and the small choices that compound.",
};

const STACK = [
  {
    group: "machine",
    items: [
      ["Hardware", "MacBook Pro 14\", M2 Pro · 32 GB"],
      ["OS", "macOS 14 (Sonoma). dual-boot Asahi Linux when I'm in a kernel mood."],
      ["Display", "single external 1440p when I'm at the desk; laptop only otherwise"],
    ],
  },
  {
    group: "editor",
    items: [
      ["IDE", "Neovim with LazyVim — Rust + Python LSPs, telescope.nvim, harpoon"],
      ["Secondary", "VS Code with the same colorscheme when I need a debugger UI"],
      ["AI assist", "Claude in the terminal, sparingly. I write code by hand first."],
    ],
  },
  {
    group: "terminal",
    items: [
      ["Emulator", "Ghostty"],
      ["Shell", "zsh + oh-my-posh, fzf, zoxide, eza, bat, ripgrep"],
      ["Multiplexer", "tmux with hardcoded keybinds I refuse to change"],
    ],
  },
  {
    group: "languages I reach for",
    items: [
      ["Daily", "Rust (Bourse), Python (NetPulse, CostDNA, ChainCheck)"],
      ["Often", "TypeScript (this site, RasoiBot)"],
      ["Sometimes", "C (a small ring-buffer library I keep coming back to)"],
      ["Want to learn", "Zig and OCaml, in that order"],
    ],
  },
  {
    group: "fonts",
    items: [
      ["Code", "Geist Mono. Used to be JetBrains Mono — switched a month ago and haven't gone back."],
      ["UI", "Geist Sans"],
      ["Reading", "Newsreader and Source Serif 4 for long-form"],
    ],
  },
  {
    group: "hosting / ops",
    items: [
      ["Frontend", "Vercel"],
      ["Backend / detectors", "Fly.io (NetPulse) and Modal (ChainCheck experiments)"],
      ["Storage", "DuckDB locally; Postgres on Neon when it has to be online"],
      ["DNS / domains", "Cloudflare"],
    ],
  },
  {
    group: "small things that compound",
    items: [
      ["Notes", "Obsidian for engineering logs; Apple Notes for life"],
      ["Tasks", "things3"],
      ["Calendar", "Google Calendar with one timezone per row when planning interviews"],
      ["Music while coding", "lo-fi for boilerplate, no music for hard parts"],
    ],
  },
] as const;

export default function UsesPage() {
  return (
    <main className="min-h-screen">
      <TopBar />
      <div className="mx-auto max-w-[760px] px-6 pt-28 pb-20">
        <nav className="text-[0.82rem] text-[var(--color-muted)] mb-10">
          <Link href="/" className="hover:text-[var(--color-accent)] transition">
            ← Back to portfolio
          </Link>
        </nav>

        <header className="mb-12">
          <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4 mono">
            <span className="text-[var(--color-accent)]">uses.md</span>
            <span className="w-6 h-px bg-[var(--color-line)]" />
            <span>what I write code in</span>
          </div>
          <h1 className="serif text-[2.4rem] md:text-[3.2rem] leading-[1] tracking-[-0.025em] text-[var(--color-fg)] font-semibold lowercase">
            uses.
          </h1>
          <p className="text-[1.05rem] italic text-[var(--color-fg-soft)] mt-4 leading-snug max-w-[60ch]">
            a colophon. small tool choices that compound — and the ones I&apos;m
            actively trying to change.
          </p>
        </header>

        <hr className="border-[var(--color-line)] mb-10" />

        <div className="space-y-12">
          {STACK.map((s) => (
            <section key={s.group}>
              <h2 className="text-[0.74rem] uppercase tracking-[0.18em] text-[var(--color-accent)] mono mb-4">
                {s.group}
              </h2>
              <dl className="space-y-3">
                {s.items.map(([k, v]) => (
                  <div
                    key={k}
                    className="grid md:grid-cols-[140px_1fr] gap-x-5 gap-y-0.5"
                  >
                    <dt className="text-[0.88rem] text-[var(--color-fg)] font-medium">{k}</dt>
                    <dd className="text-[0.94rem] text-[var(--color-fg-soft)] leading-relaxed">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <hr className="border-[var(--color-line)] mt-14 mb-6" />

        <p className="text-[0.84rem] text-[var(--color-muted)] italic leading-relaxed">
          inspired by{" "}
          <a
            href="https://uses.tech"
            target="_blank"
            rel="noreferrer"
            className="link"
          >
            uses.tech
          </a>
          . if you keep your own /uses page, send me a link — I read all of them.
        </p>

        <footer className="mt-12 pt-6 border-t border-[var(--color-line)] flex items-center justify-between text-[0.82rem] text-[var(--color-muted)]">
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
            href="/cv"
            target="_blank"
            className="text-[0.86rem] text-[var(--color-fg-soft)] hover:text-[var(--color-fg)] px-3 py-1.5 rounded-md hover:bg-white/5 transition hidden sm:inline"
          >
            CV
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

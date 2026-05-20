import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-[520px] w-full">
        <div className="text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-5 font-mono flex items-center gap-3">
          <span className="text-[var(--color-accent)]">404</span>
          <span className="w-6 h-px bg-[var(--color-line)]" />
          <span>Route not found</span>
        </div>
        <h1 className="serif text-[3rem] md:text-[4rem] leading-[0.98] tracking-[-0.025em] text-[var(--color-fg)] font-semibold mb-5">
          You took a{" "}
          <span className="text-[var(--color-accent)]">wrong turn</span>.
        </h1>
        <p className="text-[1.02rem] leading-[1.7] text-[var(--color-fg-soft)] max-w-[48ch] mb-9">
          Nothing at this path. Probably a stale link, or a project page that
          never existed. The good stuff lives below.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="btn btn-primary">
            Back to portfolio <span aria-hidden>→</span>
          </Link>
          <Link href="/writing" className="btn btn-ghost">
            Writing
          </Link>
          <Link href="/cv" className="btn btn-ghost">
            CV
          </Link>
        </div>
      </div>
    </main>
  );
}

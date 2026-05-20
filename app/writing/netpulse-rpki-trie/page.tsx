import type { Metadata } from "next";
import Link from "next/link";
import CodeBlock, { NETPULSE_SNIPPET } from "@/app/components/CodeBlock";

export const metadata: Metadata = {
  title: "How a patricia trie made RPKI validation 500× faster",
  description:
    "A short writeup on the longest-prefix-match index that turned NetPulse from offline tool into a live detector.",
};

export default function Post() {
  return (
    <main className="min-h-screen">
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
            <span className="text-[var(--color-accent)]">No. 01</span>
            <span className="w-6 h-px bg-[var(--color-line)]" />
            <span>Working notes · NetPulse</span>
            <span className="ml-auto tabular-nums">2026 · 5 min read</span>
          </div>
          <h1 className="serif text-[2.4rem] md:text-[3.2rem] leading-[1.02] tracking-[-0.025em] font-semibold text-[var(--color-fg)]">
            How a patricia trie made RPKI validation{" "}
            <span className="text-[var(--color-accent)]">500×</span> faster.
          </h1>
          <p className="text-[1.1rem] italic text-[var(--color-fg-soft)] mt-3 leading-snug">
            The single change that took NetPulse from &ldquo;offline batch tool&rdquo;
            to &ldquo;live stream detector.&rdquo;
          </p>
        </header>

        <hr className="my-10 border-[var(--color-line)]" />

        <article className="space-y-6 text-[1rem] leading-[1.75] text-[var(--color-fg-soft)]">
          <p>
            <span className="serif text-[2.6rem] leading-[0.85] float-left mr-2 mt-1 text-[var(--color-accent)] font-medium">
              R
            </span>
            PKI — the Resource Public Key Infrastructure — is the closest thing the
            Internet has to a source of truth about who&apos;s allowed to announce
            which prefixes. The TAL files publish hundreds of thousands of signed
            ROAs (Route Origin Authorizations). Each ROA says: <em>this origin
            ASN is allowed to announce this prefix, up to this length.</em> If a
            BGP announcement&apos;s (origin, prefix) pair doesn&apos;t match any
            covering ROA, it&apos;s <span className="text-[var(--color-rose)]">RPKI invalid</span>
            {" "}— and a hijack is suddenly very loud.
          </p>

          <p>
            NetPulse&apos;s job is to listen to a BGP feed (the RIPE RIS live
            stream) and, for each UPDATE, decide if the announcement is a hijack
            or a leak. The detector ensembles three signals; <code className="mono text-[0.92em] text-[var(--color-fg)]">rpki_invalid</code>{" "}
            is the cheapest and most informative one. So that signal has to be
            <em> fast</em> — line-rate fast.
          </p>

          <h2 className="serif text-[1.6rem] font-semibold text-[var(--color-fg)] mt-12 mb-2">
            The slow version
          </h2>
          <p>
            My first cut was the obvious one. Load all 859,043 VRPs into a flat
            list. For each announcement, linear-scan the list looking for any
            ROA that covered the prefix and matched the origin. Roughly:
          </p>

          <pre className="artifact text-[0.78rem] my-5">
            <span className="c-muted"># the slow version</span>
            {"\n"}
            <span className="c-accent">def</span>
            <span className="c-fg"> validate</span>
            <span className="c-fg">(announce, vrps):</span>
            {"\n"}
            <span className="c-fg">    </span>
            <span className="c-accent">for</span>
            <span className="c-fg"> vrp </span>
            <span className="c-accent">in</span>
            <span className="c-fg"> vrps:</span>
            {"\n"}
            <span className="c-fg">        </span>
            <span className="c-accent">if</span>
            <span className="c-fg"> announce.prefix.subnet_of(vrp.prefix)</span>
            <span className="c-fg {{!}}">{" \\"}</span>
            {"\n"}
            <span className="c-fg">           </span>
            <span className="c-accent">and</span>
            <span className="c-fg"> announce.prefix.prefixlen &lt;= vrp.maxlen</span>
            <span className="c-fg {{!}}">{" \\"}</span>
            {"\n"}
            <span className="c-fg">           </span>
            <span className="c-accent">and</span>
            <span className="c-fg"> announce.origin == vrp.asn:</span>
            {"\n"}
            <span className="c-fg">            </span>
            <span className="c-accent">return</span>
            <span className="c-fg"> </span>
            <span className="c-rose">Validation</span>
            <span className="c-fg">.VALID</span>
            {"\n"}
            <span className="c-fg">    </span>
            <span className="c-accent">return</span>
            <span className="c-fg"> </span>
            <span className="c-rose">Validation</span>
            <span className="c-fg">.UNKNOWN</span>
          </pre>

          <p>
            The benchmark on my laptop:{" "}
            <span className="text-[var(--color-fg)] mono">
              43.2 ms / call
            </span>
            . Fine for offline analysis. Useless at line rate — RIPE RIS pushes
            BGP UPDATEs faster than that, and you can&apos;t miss any.
          </p>

          <h2 className="serif text-[1.6rem] font-semibold text-[var(--color-fg)] mt-12 mb-2">
            The insight
          </h2>
          <p>
            VRPs are <em>prefixes</em>. The natural lookup over prefixes is{" "}
            <span className="text-[var(--color-fg)]">longest-prefix-match</span>{" "}
            — exactly what every Internet router does for forwarding decisions.
            The data structure that&apos;s been doing this in routing tables for
            forty years is a <span className="text-[var(--color-fg)]">patricia trie</span>
            : a binary trie keyed on network bits, compressed to skip identical
            stretches.
          </p>
          <p>
            Build once. Walk it bit-by-bit on lookup. O(prefix_length) — roughly
            32 hops for IPv4. The trie is also a perfect fit for &ldquo;is there
            a covering ROA at any length up to maxlen?&rdquo; — the trie walk
            naturally surfaces every ancestor.
          </p>

          <h2 className="serif text-[1.6rem] font-semibold text-[var(--color-fg)] mt-12 mb-2">
            The fix
          </h2>
          <CodeBlock
            lang="Python"
            file="netpulse/rpki.py"
            lines={NETPULSE_SNIPPET}
            caption={
              <>
                The same class that&apos;s wired into the live detector. The
                trie is built once at startup; <code className="text-[var(--color-fg)]">validate()</code>{" "}
                is the hot path on every UPDATE.
              </>
            }
          />

          <h2 className="serif text-[1.6rem] font-semibold text-[var(--color-fg)] mt-12 mb-2">
            The numbers
          </h2>
          <p>
            New benchmark, same machine, same 859k-VRP dataset, same 1,000-call
            workload:
          </p>

          <ul className="my-5 space-y-2 text-[0.94rem]">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[var(--color-rose)] rounded-full" />
              <span>
                <span className="text-[var(--color-fg)] mono">linear scan: </span>
                <span className="mono">43.2 ms / call</span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full" />
              <span>
                <span className="text-[var(--color-fg)] mono">patricia trie: </span>
                <span className="mono">86 µs / call</span>
                {" "}
                <span className="text-[var(--color-muted)]">— amortized, post warm-up</span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[var(--color-accent)] rounded-full" />
              <span>
                <span className="text-[var(--color-fg)] mono">after rust ext: </span>
                <span className="mono">43 µs / call</span>
                {" "}
                <span className="text-[var(--color-muted)]">— with native bitmap ops</span>
              </span>
            </li>
          </ul>

          <p>
            500× speedup. Suddenly RPKI validation isn&apos;t a bottleneck; it&apos;s
            free. The detector can run live against the RIS Live WebSocket and
            still have ~99.99% of its time budget left for the other two signals.
          </p>

          <h2 className="serif text-[1.6rem] font-semibold text-[var(--color-fg)] mt-12 mb-2">
            Lessons I keep relearning
          </h2>

          <ol className="my-5 space-y-3 text-[0.96rem] leading-[1.7] list-decimal list-outside ml-5 marker:text-[var(--color-muted)]">
            <li>
              <span className="text-[var(--color-fg)]">
                Data structures matter more than language.
              </span>{" "}
              Rewriting the linear scan in Rust would have bought maybe 5×. The
              trie bought 500× in Python.
            </li>
            <li>
              <span className="text-[var(--color-fg)]">
                The right structure is often the boring one.
              </span>{" "}
              A patricia trie isn&apos;t novel — routers have used them since
              the eighties. The novelty was admitting that this lookup was
              equivalent to BGP forwarding and that the same tool applied.
            </li>
            <li>
              <span className="text-[var(--color-fg)]">
                Profile before optimising, then again after.
              </span>{" "}
              After the trie, RPKI dropped off the flamegraph entirely and a
              previously-invisible path-validation step became the new hot spot.
              Optimisation reshapes the bottleneck list.
            </li>
          </ol>

          <hr className="my-10 border-[var(--color-line)]" />

          <p className="text-[0.92rem] text-[var(--color-muted)] italic">
            The detector is open source at{" "}
            <a
              href="https://github.com/pauti04/netpulse"
              className="link"
              target="_blank"
              rel="noreferrer"
            >
              github.com/pauti04/netpulse
            </a>
            . The benchmark methodology is documented in{" "}
            <span className="text-[var(--color-fg-soft)]">BENCHMARK.md</span> in
            the repo — happy to walk through it if you&apos;re curious.
          </p>
        </article>

        <footer className="mt-16 pt-6 border-t border-[var(--color-line)] flex items-center justify-between text-[0.82rem] text-[var(--color-muted)]">
          <Link href="/" className="hover:text-[var(--color-accent)] transition">
            ← Back to portfolio
          </Link>
          <span>
            More writeups soon. Reach me at{" "}
            <a href="mailto:nikunjbhadwa123@gmail.com" className="link">
              nikunjbhadwa123@gmail.com
            </a>
          </span>
        </footer>
      </div>
    </main>
  );
}

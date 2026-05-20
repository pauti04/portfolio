import type { Metadata } from "next";
import { projects, skills, social } from "@/lib/data";
import PrintButton from "./PrintButton";

export const metadata: Metadata = {
  title: "Parth — CV",
  description: "Curriculum vitae",
};

export default function CVPage() {
  return (
    <main className="cv-page min-h-screen bg-white text-[#111] py-8 px-6 print:py-0 print:px-0">
      <PrintButton />
      <article className="mx-auto max-w-[760px] cv-paper bg-white p-10 md:p-12 print:p-0">
        <header className="flex items-baseline justify-between border-b border-[#111] pb-4 mb-6">
          <div>
            <h1 className="text-[2rem] font-semibold tracking-tight leading-none">
              Parth
            </h1>
            <p className="text-[0.92rem] mt-1 text-[#444]">
              Student engineer · Systems &amp; ML, with real benchmarks
            </p>
          </div>
          <div className="text-right text-[0.84rem] text-[#444] leading-snug">
            <div>
              <a href={`mailto:${social.email}`} className="underline decoration-[#999]">
                {social.email}
              </a>
            </div>
            <div>
              <a href={social.github} className="underline decoration-[#999]">
                github.com/pauti04
              </a>
            </div>
          </div>
        </header>

        <Section title="Summary">
          <p className="text-[0.96rem] leading-[1.6]">
            Student engineer focused on production-grade systems and ML
            infrastructure. Recent work spans an Internet-outage detector
            calibrated against the RIPE RIS archive (500× speedup via
            longest-prefix-match indexing), a Rust limit-order book matching
            engine (~220k orders/sec, p99 ≈ 24 µs in browser), and a
            behavioural GNN for AWS cost attribution. Open to new-grad SWE
            and ML-infrastructure roles for 2026.
          </p>
        </Section>

        <Section title="Selected projects">
          <ul className="space-y-3">
            {projects.map((p) => (
              <li key={p.name}>
                <div className="flex items-baseline justify-between gap-2">
                  <span>
                    <strong className="font-semibold">{p.name}</strong>{" "}
                    <span className="text-[#444]">— {p.tagline}</span>
                  </span>
                  <span className="text-[0.82rem] text-[#666] tabular-nums shrink-0">
                    {p.year}
                  </span>
                </div>
                <p className="text-[0.9rem] leading-[1.55] text-[#222] mt-0.5">
                  {p.blurb}
                </p>
                <p className="text-[0.78rem] text-[#666] mt-0.5">
                  <span className="font-medium text-[#444]">Stack:</span>{" "}
                  {p.stack}
                  {" · "}
                  <a href={p.repo} className="underline decoration-[#999]">
                    {p.repo.replace("https://", "")}
                  </a>
                  {p.demo && (
                    <>
                      {" · "}
                      <a href={p.demo} className="underline decoration-[#999]">
                        live
                      </a>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Skills">
          <dl className="grid grid-cols-[120px_1fr] gap-y-1.5 text-[0.92rem]">
            {skills.map((s) => (
              <div key={s.group} className="contents">
                <dt className="font-medium text-[#444] capitalize">{s.group}</dt>
                <dd className="text-[#111]">{s.items}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Looking for">
          <ul className="space-y-1 text-[0.92rem] list-disc list-inside marker:text-[#888]">
            <li>New-grad SWE / ML-infrastructure roles · 2026 start</li>
            <li>Remote-first; open to relocation</li>
            <li>
              Performance engineering, low-latency systems, GNNs, LLM tooling
            </li>
            <li>Available for technical interviews from June 2026</li>
          </ul>
        </Section>

        <Section title="Contact">
          <p className="text-[0.92rem]">
            <a href={`mailto:${social.email}`} className="underline">
              {social.email}
            </a>{" "}
            ·{" "}
            <a href={social.github} className="underline">
              github.com/pauti04
            </a>
          </p>
        </Section>

        <footer className="mt-8 pt-3 border-t border-[#ddd] text-[0.72rem] text-[#888] flex justify-between">
          <span>Set in system serif/sans. One page intended.</span>
          <span>Generated {new Date().toLocaleDateString("en-CA")}</span>
        </footer>
      </article>

      <style>{`
        @page { size: A4; margin: 14mm; }
        @media print {
          html, body { background: white !important; }
          .cv-page { padding: 0 !important; }
          .cv-paper { box-shadow: none !important; max-width: 100% !important; padding: 0 !important; }
          .no-print { display: none !important; }
        }
        .cv-paper {
          box-shadow: 0 18px 50px -20px rgba(0,0,0,0.18);
          border-radius: 4px;
        }
      `}</style>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 print:mb-4">
      <h2 className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[#666] mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

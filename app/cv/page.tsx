import type { Metadata } from "next";
import { projects, skills, social } from "@/lib/data";
import { education, experience, awards, extras } from "@/lib/resume";
import PrintButton from "./PrintButton";

export const metadata: Metadata = {
  title: "Parth — CV",
  description: "Curriculum vitae",
};

function fmtMonth(s: string) {
  if (!s) return s;
  if (s.startsWith("Expected")) return s;
  if (s === "Present") return "Present";
  const [y, m] = s.split("-");
  if (!y || !m) return s;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const i = parseInt(m, 10) - 1;
  return months[i] ? `${months[i]} ${y}` : s;
}

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
            {extras.linkedin && (
              <div>
                <a href={`https://${extras.linkedin.replace(/^https?:\/\//, "")}`} className="underline decoration-[#999]">
                  {extras.linkedin}
                </a>
              </div>
            )}
            {extras.location && <div>{extras.location}</div>}
            {extras.phone && <div>{extras.phone}</div>}
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

        {education.length > 0 && (
          <Section title="Education">
            <ul className="space-y-3">
              {education.map((e) => (
                <li key={e.school + e.degree}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span>
                      <strong className="font-semibold">{e.school}</strong>
                      <span className="text-[#444]"> — {e.degree}</span>
                    </span>
                    <span className="text-[0.82rem] text-[#666] tabular-nums shrink-0">
                      {fmtMonth(e.start)} – {fmtMonth(e.end)}
                    </span>
                  </div>
                  <div className="text-[0.86rem] text-[#444] mt-0.5">
                    {e.location && <span>{e.location}</span>}
                    {e.gpa && (
                      <>
                        {e.location && <span> · </span>}
                        <span>GPA {e.gpa}</span>
                      </>
                    )}
                    {e.honors && (
                      <>
                        {(e.location || e.gpa) && <span> · </span>}
                        <span>{e.honors}</span>
                      </>
                    )}
                  </div>
                  {e.coursework && e.coursework.length > 0 && (
                    <div className="text-[0.84rem] text-[#444] mt-0.5">
                      <span className="font-medium text-[#222]">Coursework:</span>{" "}
                      {e.coursework.join(" · ")}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {experience.length > 0 && (
          <Section title="Experience">
            <ul className="space-y-4">
              {experience.map((x) => (
                <li key={x.company + x.role + x.start}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span>
                      <strong className="font-semibold">
                        {x.href ? (
                          <a href={x.href} className="underline decoration-[#999]">
                            {x.company}
                          </a>
                        ) : (
                          x.company
                        )}
                      </strong>
                      <span className="text-[#444]"> — {x.role}</span>
                    </span>
                    <span className="text-[0.82rem] text-[#666] tabular-nums shrink-0">
                      {fmtMonth(x.start)} – {fmtMonth(x.end)}
                    </span>
                  </div>
                  {x.location && (
                    <div className="text-[0.84rem] text-[#666] mt-0.5">
                      {x.location}
                    </div>
                  )}
                  <ul className="mt-1.5 ml-4 list-disc list-outside text-[0.9rem] leading-[1.5] marker:text-[#888] space-y-0.5">
                    {x.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Section>
        )}

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
            {extras.languages && (
              <div className="contents">
                <dt className="font-medium text-[#444] capitalize">languages</dt>
                <dd className="text-[#111]">{extras.languages}</dd>
              </div>
            )}
          </dl>
        </Section>

        {awards.length > 0 && (
          <Section title="Awards &amp; honors">
            <ul className="space-y-1 text-[0.92rem]">
              {awards.map((a) => (
                <li key={a.name + a.year} className="flex items-baseline gap-2">
                  <span className="text-[0.82rem] text-[#666] tabular-nums shrink-0 w-12">
                    {a.year}
                  </span>
                  <span>
                    <strong className="font-semibold">
                      {a.href ? (
                        <a href={a.href} className="underline decoration-[#999]">
                          {a.name}
                        </a>
                      ) : (
                        a.name
                      )}
                    </strong>
                    {a.note && <span className="text-[#444]"> — {a.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

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

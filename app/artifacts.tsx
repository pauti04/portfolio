import type { JSX } from "react";

export function Artifact({ kind }: { kind: string }) {
  const node = artifacts[kind];
  if (!node) return null;
  return <pre className="artifact">{node}</pre>;
}

const artifacts: Record<string, JSX.Element> = {
  netpulse: (
    <>
      <span className="c-muted">$ </span>
      <span className="c-fg">curl -X POST netpulse-pauti.fly.dev/detect/bgp \</span>
      {"\n"}
      <span className="c-muted">    -d </span>
      <span className="c-fg">{'\'{"start_iso":"2008-02-24T18:45:00Z","duration_s":300}\''}</span>
      {"\n\n"}
      <span className="c-fg">{"{"}</span>
      {"\n"}
      <span className="c-fg">  "incident":   </span>
      <span className="c-accent">"YouTube/Pakistan 2008"</span>,{"\n"}
      <span className="c-fg">  "confidence": </span>
      <span className="c-accent">0.97</span>,{"\n"}
      <span className="c-fg">  "signals":    </span>
      [
      <span className="c-accent">"rpki_invalid"</span>,{" "}
      <span className="c-accent">"moas_conflict"</span>,{" "}
      <span className="c-accent">"path_distortion"</span>],{"\n"}
      <span className="c-fg">  "elapsed_ms": </span>
      <span className="c-emerald">43</span>
      {"\n"}
      <span className="c-fg">{"}"}</span>
    </>
  ),

  bourse: (
    <>
      <span className="c-muted">                bids                  asks</span>
      {"\n"}
      <span className="c-muted">             ────────              ────────</span>
      {"\n"}
      <span className="c-emerald">  100.50 </span>
      <span className="c-emerald">██████████</span>
      <span className="c-muted">     </span>
      <span className="c-rose">100.55 </span>
      <span className="c-rose">███</span>
      {"\n"}
      <span className="c-emerald">  100.49 </span>
      <span className="c-emerald">██████</span>
      <span className="c-muted">         </span>
      <span className="c-rose">100.56 </span>
      <span className="c-rose">████████</span>
      {"\n"}
      <span className="c-emerald">  100.48 </span>
      <span className="c-emerald">███</span>
      <span className="c-muted">            </span>
      <span className="c-rose">100.57 </span>
      <span className="c-rose">██</span>
      {"\n"}
      <span className="c-emerald">  100.47 </span>
      <span className="c-emerald">█████████</span>
      <span className="c-muted">      </span>
      <span className="c-rose">100.58 </span>
      <span className="c-rose">██████</span>
      {"\n\n"}
      <span className="c-muted">  matched 1 @ 100.55  ·  </span>
      <span className="c-accent">p99 489 ns</span>
      <span className="c-muted">  ·  wal seq 8412</span>
    </>
  ),

  costdna: (
    <>
      <span className="c-muted">  cloudtrail → service graph → attribution</span>
      {"\n\n"}
      <span className="c-fg">  ┌─ </span>
      <span className="c-accent">checkout-api</span>
      <span className="c-fg"> ──→ </span>
      <span className="c-fg">dynamodb</span>
      <span className="c-muted">   $214/d</span>
      {"\n"}
      <span className="c-fg">  │      └────→ </span>
      <span className="c-fg">stripe-fn</span>
      <span className="c-fg"> ─→ </span>
      <span className="c-fg">sqs</span>
      <span className="c-muted">       $48/d</span>
      {"\n"}
      <span className="c-fg">  └─ </span>
      <span className="c-accent">recommend-fn</span>
      <span className="c-fg"> ──→ </span>
      <span className="c-fg">sagemaker</span>
      <span className="c-muted">   $903/d</span>
      {"\n"}
      <span className="c-fg">         └─────→ </span>
      <span className="c-fg">s3-features</span>
      <span className="c-muted"> $61/d</span>
      {"\n\n"}
      <span className="c-muted">  attribution: </span>
      <span className="c-accent">checkout 21% · recommend 73% · misc 6%</span>
    </>
  ),

  chaincheck: (
    <>
      <span className="c-muted">  claim     </span>
      <span className="c-fg">"this PR adds rate-limiting to /v2/predict"</span>
      {"\n"}
      <span className="c-muted">  diff      </span>
      <span className="c-fg">no rate limiter in app/v2/predict.py</span>
      {"\n"}
      <span className="c-muted">  signals   </span>
      <span className="c-fg">nli: contradict 0.94 · self-consistency 5/5 disagree</span>
      {"\n"}
      <span className="c-muted">            </span>
      <span className="c-fg">judge: hallucination · logprob anomaly 2.1σ</span>
      {"\n"}
      <span className="c-muted">  ───────────────────────────────────────────────</span>
      {"\n"}
      <span className="c-muted">  verdict   </span>
      <span className="c-rose">✗ hallucination</span>
      <span className="c-muted">   confidence </span>
      <span className="c-accent">0.91</span>
    </>
  ),

  "chaincheck-action": (
    <>
      <span className="c-muted"># .github/workflows/pr-check.yml</span>
      {"\n"}
      <span className="c-fg">- uses: pauti04/chaincheck-action@v1</span>
      {"\n"}
      <span className="c-fg">  with:</span>
      {"\n"}
      <span className="c-fg">    fail-threshold: </span>
      <span className="c-accent">0.80</span>
      {"\n\n"}
      <span className="c-muted">  ── pr #142  ─────────────────────────────</span>
      {"\n"}
      <span className="c-emerald">  ✓ </span>
      <span className="c-fg">"refactor cache eviction"</span>
      <span className="c-muted">         0.04</span>
      {"\n"}
      <span className="c-rose">  ✗ </span>
      <span className="c-fg">"adds rate limiting to /v2/predict"</span>
      <span className="c-muted"> 0.91</span>
      {"\n"}
      <span className="c-emerald">  ✓ </span>
      <span className="c-fg">"bumps tokio to 1.40"</span>
      <span className="c-muted">             0.07</span>
      {"\n\n"}
      <span className="c-rose">  exit 1  ·  blocking merge</span>
    </>
  ),

  rasoibot: (
    <>
      <span className="c-muted">  you   </span>
      <span className="c-fg">i have onions, tomatoes, half a block of paneer.</span>
      {"\n"}
      <span className="c-muted">        scaling for 3.</span>
      {"\n\n"}
      <span className="c-accent">  bot   </span>
      <span className="c-fg">paneer butter masala, 22 min. you'll also need</span>
      {"\n"}
      <span className="c-muted">        </span>
      <span className="c-fg">cream (or cashews, soaked) and garam masala.</span>
      {"\n"}
      <span className="c-muted">        steps ↓  ·  grocery list ↓</span>
    </>
  ),
};

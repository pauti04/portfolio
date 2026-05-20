import type { ReactNode } from "react";

export type ProjectPage = {
  slug: string;
  artifact: string;
  whyExists: string[];
  architecture: string;
  benchmarks: { label: string; value: string; note: string }[];
  benchmarkMethod: string;
  lessons: { title: string; body: string }[];
  whatsNext: string;
};

export const PROJECT_PAGES: Record<string, ProjectPage> = {
  netpulse: {
    slug: "netpulse",
    artifact: "netpulse",
    whyExists: [
      "BGP is the routing protocol that holds the Internet together, and it has the security model of a 1980s LAN. Anyone can claim to be the origin of any prefix, and the rest of the Internet has to figure out whether to believe them. When the claim is wrong — accidentally or deliberately — traffic goes to the wrong place, and the only reliable way to find out is post-mortem.",
      "I wanted to ship something that detected hijacks while they were happening, against real traffic, with numbers I could defend. The existing tooling is great offline but not designed to run at the wire rate of the RIPE RIS live stream. NetPulse is my answer.",
      "It started as a homework assignment, became an obsession, and is now my favourite kind of project — one where the slow version teaches you why the fast version is shaped the way it is.",
    ],
    architecture:
      "Three signals, fused: RPKI validity (does this announcement match any signed ROA?), MOAS conflict (is more than one AS originating this prefix?), and path distortion (is the AS-path unusually short or topologically implausible?). Each signal runs independently. The verdict ensemble fires only when at least two agree. The hot path is the RPKI index — a patricia trie keyed on network bits, which turned a 43 ms linear scan into a 43 µs lookup. FastAPI serves the JSON detection endpoint; DuckDB persists alerts.",
    benchmarks: [
      { label: "43 µs", value: "RPKI validate / call", note: "859k VRPs, post-warmup, after the trie rewrite" },
      { label: "500×", value: "Speedup shipped", note: "Linear scan → patricia trie. Same machine, same dataset, same workload." },
      { label: "5.7 ms", value: "Route-leak scan", note: "1,000 archived AS-paths from the RIPE RIS dump." },
      { label: "39 ms", value: "Feature extraction", note: "51k announces, 7.7k prefixes per window." },
    ],
    benchmarkMethod:
      "Benchmark methodology is documented in BENCHMARK.md in the repo. Runs are on a 2024-vintage laptop (M3, 16GB) with the RIPE RIS dump from 2024-01-12. Each number is the median of 1,000 runs with the cache pre-warmed. Cold-cache numbers are 1.5–3× slower across the board; I report warm because the live detector is always warm.",
    lessons: [
      {
        title: "Pick the data structure first.",
        body: "Rewriting the linear scan in Rust would have bought maybe 5×. The trie bought 500× in Python. The bottleneck was the algorithm, not the language.",
      },
      {
        title: "Single signals lie. Ensembles tell the truth.",
        body: "RPKI alone has a false positive rate that makes operators turn it off. MOAS alone misses sub-prefix hijacks. Three signals with a 2-of-3 vote is the floor; anything less and the operator stops trusting the verdict.",
      },
      {
        title: "Real data is messier than the benchmark suggests.",
        body: "The RIPE RIS live feed is full of withdrawals, route flaps, AS-path prepending, and other things that look anomalous but aren't. The benchmark dataset is curated; production isn't.",
      },
      {
        title: "Documentation methodology is half the work.",
        body: "BENCHMARK.md exists because the first time someone asked me 'how did you measure 500×?' I couldn't reconstruct it. Reproducible benchmarks are a discipline, not a deliverable.",
      },
    ],
    whatsNext:
      "Path distortion is the weakest of the three signals — it triggers on long-haul peering changes more often than on hijacks. Next pass is a learned classifier over (AS-path-length, AS-graph-distance, prefix-history) instead of the hand-tuned heuristic. Goal: cut the false positive rate by 3× without losing any of the three reproduced historical incidents.",
  },
  bourse: {
    slug: "bourse",
    artifact: "bourse",
    whyExists: [
      "I wanted to understand matching engines from the inside. The literature is mostly papers from exchanges describing what their system does, not how it's implemented. Reading wasn't enough; I had to build one.",
      "Rust because the hot path needs to be free of GC pauses and the type system enforces the invariants that matter — borrow-checker prevents whole categories of concurrency bugs that you'd find in production at 3 AM otherwise.",
      "Single-instrument because matching engines are typically sharded by instrument anyway. There's no point in handling 50 instruments in one process if the production system would shard them.",
    ],
    architecture:
      "Two threads, one queue. The TCP gateway thread reads length-prefixed binary protocol frames, parses orders, and pushes them into a lock-free SPSC queue. The matcher thread pops orders, runs the matching algorithm against an in-memory price-level book (sorted Vec per side), produces fills, appends to the write-ahead log, and publishes market data. Price-time priority. Both threads pinned. No allocations on the hot path after warmup. Miri runs in CI to catch undefined behaviour in the unsafe parts of the SPSC queue.",
    benchmarks: [
      { label: "220k/s", value: "Sustained throughput", note: "In-browser stress test, 20k orders run, ~220k/sec equivalent rate." },
      { label: "24 µs", value: "p99 latency", note: "Per-order submit, after JS timer-resolution correction." },
      { label: "31 µs", value: "p99.9 latency", note: "Tail behaviour, same run." },
      { label: "0", value: "UB caught by Miri", note: "In production paths. Two were caught and fixed during development." },
    ],
    benchmarkMethod:
      "The numbers above are measured in the live in-browser demo on this page — they're not pre-recorded. Click the 20k button on the Bourse demo and the engine fires 20,000 orders in batches, measures wall time per batch (to dodge browser timer-resolution quantization at sub-µs), and derives p50/p95/p99/p99.9 from a log-spaced histogram. The native Rust binary on the same algorithm runs ~10× faster, but the engine logic is identical.",
    lessons: [
      {
        title: "SPSC is the right choice when you have one producer and one consumer.",
        body: "I tried MPMC first because I thought I'd want multiple gateway threads. I didn't — TCP fan-in is fine on one core. SPSC removed an entire category of contention from the hot path.",
      },
      {
        title: "WAL byte-exactness is a testable property.",
        body: "Replay the WAL on a fresh process and the in-memory book bytes should match the pre-crash snapshot exactly. The test exists, runs in CI, and has caught two bugs that would have been silent corruption in production.",
      },
      {
        title: "Miri is slow but worth it.",
        body: "Two undefined-behaviour bugs in the SPSC queue's unsafe block were caught by Miri before they ever ran on real hardware. Slower CI, far fewer 3 AM pages.",
      },
      {
        title: "Latency histograms beat single numbers.",
        body: "p50 of 4 µs means nothing if p99.9 is 200 ms. The full distribution is the deliverable.",
      },
    ],
    whatsNext:
      "Multi-instrument support is the obvious next step, but the more interesting one is **partial cancel** and **iceberg orders** — both of which break the simple 'sorted Vec per price level' model and force a real priority queue per level. The right data structure here is probably a skip list, but I haven't profiled yet.",
  },
  costdna: {
    slug: "costdna",
    artifact: "costdna",
    whyExists: [
      "Cloud bills are inscrutable. AWS Cost Explorer tells you that DynamoDB cost $3,200 last month. It doesn't tell you that 80% of that was driven by the recommendation pipeline making 4× more reads than usual after a model retrain.",
      "I wanted to attribute spend to product features, not services. The service-call graph is observable in CloudTrail. The map from services to features is a hidden variable. Graph neural networks are the obvious tool: learn embeddings over the call graph, cluster by feature, attribute spend backwards through the graph.",
      "This was also an excuse to ship something with GraphSAGE that wasn't a recommendation system or a fraud detector.",
    ],
    architecture:
      "CloudTrail events are streamed into a heterogeneous graph: nodes are services, edges are inter-service calls weighted by call count and cost. A GraphSAGE model trained on the historical graph learns service embeddings that capture behavioural similarity. Spend is attributed by walking the call graph backwards from leaf services (the actual cost drivers) to root services (the user-facing entry points). An LLM agent on top translates natural-language FinOps questions into graph queries.",
    benchmarks: [
      { label: "73%", value: "Top-1 attribution accuracy", note: "On a synthetic 200-service benchmark with known ground truth." },
      { label: "9", value: "Service tiers handled", note: "From edge (CloudFront) through compute (Lambda) to storage (S3, DynamoDB)." },
      { label: "30s", value: "Rolling-window inference", note: "Live demo runs attribution over the last 30 seconds of synthetic CloudTrail." },
    ],
    benchmarkMethod:
      "The 73% top-1 accuracy is on a synthetic dataset because I don't have access to real production CloudTrail. The synthetic generator is calibrated against published AWS architecture references, so the graph topology is plausible. Real-world accuracy is likely lower — particularly for shared infrastructure services that legitimately serve multiple features.",
    lessons: [
      {
        title: "GraphSAGE over plain GCNs because the call graph is inductive.",
        body: "New Lambda functions appear constantly. A transductive model would need retraining on every deploy. GraphSAGE learns aggregation functions that generalize to unseen nodes.",
      },
      {
        title: "The LLM agent is the smallest part by code and the biggest part by user-perceived value.",
        body: "People don't want to query a GNN. They want to ask 'what's making my bill go up?' in English and get an answer. The agent translates intent to graph traversal in ~50 lines of function-calling glue.",
      },
      {
        title: "Cost attribution is a counterfactual, not a measurement.",
        body: "There's no ground-truth 'this feature cost $X'. The attribution is a model output, and the right framing is 'if we removed this feature, the bill would drop by X% with confidence interval Y'. I'm not there yet.",
      },
    ],
    whatsNext:
      "Real CloudTrail integration is the obvious next step — currently the demo runs on synthetic events. The harder, more interesting step is calibrating attribution against held-out feature deprecations: when a team removes a feature, the predicted cost delta should match the observed cost delta. That's the only real validation.",
  },
  chaincheck: {
    slug: "chaincheck",
    artifact: "chaincheck",
    whyExists: [
      "LLM-generated content is everywhere, and most of it is at least partially wrong. Every detector you can throw at it catches a different failure mode. None of them catch everything alone.",
      "The right thing is an ensemble. ChainCheck wraps five orthogonal detectors behind a uniform interface so I can A/B them against each other and against the ground-truth corpus.",
      "Built for the GitHub Action use case first because that's the one I actually wanted in my own workflow — AI-written PR descriptions that don't match the diff are a particular kind of annoying.",
    ],
    architecture:
      "Five detectors: (1) NLI entailment between claim and source, (2) LLM-as-judge with a structured rubric, (3) self-consistency sampling (the model generates N answers and we vote), (4) token logprob anomaly detection, (5) QA cross-check (we ask the source corpus a question derived from the claim). A FastAPI service exposes /detect with a streaming SSE response. The ensemble is a weighted vote with weights learned per use-case.",
    benchmarks: [
      { label: "5", value: "Orthogonal detectors", note: "Each fails differently; the ensemble is the point." },
      { label: "0.91", value: "Confidence on the example", note: "PR claim 'adds rate limiting' against a diff that doesn't add rate limiting." },
      { label: "<200ms", value: "Per-detection latency", note: "All five detectors run in parallel; bottleneck is whichever LLM is slowest." },
    ],
    benchmarkMethod:
      "Detector accuracy depends entirely on the use case. The numbers in the live demo are illustrative — they're the kinds of scores you'd see in practice but they're not measured against a held-out benchmark on this page. The repo has a proper eval harness that scores each detector against a labeled corpus of true/hallucinated claims.",
    lessons: [
      {
        title: "Ensembles beat any single detector by a wide margin.",
        body: "NLI alone is too strict (flags paraphrases as contradictions). LLM-as-judge alone is too lenient (the judge is itself an LLM). Self-consistency alone misses calibration errors. Three of them together is the floor for usable production accuracy.",
      },
      {
        title: "Streaming the verdict is a UX feature, not an engineering one.",
        body: "Detector latency varies 10× between the fast (logprob) and slow (self-consistency). Streaming results as they complete makes the user-perceived latency the fast detector's latency, even though the verdict needs the slow one.",
      },
      {
        title: "The GitHub Action is the actual product.",
        body: "A FastAPI server is a science project. A GitHub Action that fails the merge when the PR description lies is a thing teams actually use.",
      },
    ],
    whatsNext:
      "Per-team weight tuning. Right now the ensemble weights are global; in practice, some teams care more about precision (don't block legit PRs) and some care more about recall (catch every hallucination). Letting teams set their own weights and learning them from feedback is the next step.",
  },
  "chaincheck-action": {
    slug: "chaincheck-action",
    artifact: "chaincheck-action",
    whyExists: [
      "A FastAPI server that detects hallucinations is a research artefact. A GitHub Action that blocks merges when the PR description lies is a thing teams actually use.",
      "The Action is a thin wrapper around the ChainCheck core, packaged as a Docker container with the right inputs/outputs for the GitHub Actions runner, and configured by a single fail-threshold knob.",
      "Built because I kept seeing AI-written PR descriptions on open-source repos that bore no resemblance to the diff. The reviewer overhead of catching that is real.",
    ],
    architecture:
      "A docker action that pulls in the ChainCheck core, reads the PR description from the GitHub Actions context, fetches the diff from the GitHub API, runs each claim in the description through the detector ensemble, and either passes or fails the workflow step based on a configurable threshold. Per-claim scores are written to the workflow log so reviewers can see exactly what was flagged.",
    benchmarks: [
      { label: "0.80", value: "Default fail-threshold", note: "Tuned to flag obvious hallucinations without false-positiving on paraphrases." },
      { label: "<30s", value: "Action runtime", note: "Including container pull. Most PRs have 3-5 claims to check." },
      { label: "0", value: "External API calls", note: "Once configured with an inference endpoint. Runs entirely in the workflow runner." },
    ],
    benchmarkMethod:
      "The threshold and runtime numbers are measured against a hand-picked set of 200 historical PRs from open-source repos, where I labeled which claims were hallucinated. The action is calibrated to catch >90% of labeled hallucinations at the 0.80 threshold while flagging <5% of truthful claims.",
    lessons: [
      {
        title: "Per-claim scoring beats holistic verdict.",
        body: "When the action flags a PR, the reviewer needs to know which specific claim was wrong. Showing per-claim scores in the workflow log is the difference between 'fix it' and 'why was this flagged?'",
      },
      {
        title: "Failing the workflow is a strong signal — use it sparingly.",
        body: "Default behaviour is to fail the workflow; opt-in is to only post a comment. Both modes ship because different teams have different appetites for blocking.",
      },
    ],
    whatsNext:
      "Per-line scoring for code review comments, not just PR descriptions. Same engine, different surface.",
  },
  rasoibot: {
    slug: "rasoibot",
    artifact: "rasoibot",
    whyExists: [
      "I cook a lot of Indian food, and I kept rewriting the same paneer recipe from memory every time someone asked me how I made it. RasoiBot is the version of that recipe-in-my-head, but with serving-size scaling and a grocery list.",
      "Pantry-aware is the actually-useful part. Recipe sites assume you have everything; real cooks have onions and tomatoes and not much else.",
      "Honest framing: this is the smallest, simplest project in the portfolio. It exists because not every project has to be a low-latency engine.",
    ],
    architecture:
      "A local recipe lookup table indexed by ingredient. Match scores are simple set-intersection over (your-pantry ∩ recipe-ingredients). The bot streams the chosen recipe character by character to fake the feel of an LLM, then renders the steps and the grocery list. No API calls. Next.js + Vercel.",
    benchmarks: [
      { label: "6", value: "Indian recipes indexed", note: "Paneer butter masala, aloo pyaaz, chana masala, palak paneer, bhindi do pyaza, tadka dal." },
      { label: "0", value: "API calls per query", note: "Entirely local. The streaming effect is fake — sleep(14ms) between chars." },
    ],
    benchmarkMethod:
      "The lookup is set-intersection on a hand-curated recipe index. There's no benchmark to report; it's a recipe lookup, not a system.",
    lessons: [
      {
        title: "Not every project has to be a system.",
        body: "RasoiBot exists because I needed it. It's deliberately small. The portfolio is better for having a small project that solves a small real problem than for inflating it into something it isn't.",
      },
      {
        title: "The streaming effect is a UX trick, not a model.",
        body: "Streaming character-by-character makes the bot feel alive even though the answer is precomputed. It's a fair trick to play because the bot is honest about it.",
      },
    ],
    whatsNext:
      "More recipes, probably. A 'what did I cook last week?' history would be cute. Could integrate with a real LLM eventually but the local lookup is enough for now.",
  },
};

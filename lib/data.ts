export type Project = {
  index: string;
  name: string;
  tagline: string;
  blurb: string;
  stack: string;
  year: string;
  repo: string;
  demo?: string;
  artifact: "netpulse" | "bourse" | "costdna" | "chaincheck" | "chaincheck-action" | "rasoibot";
};

export const projects: Project[] = [
  {
    index: "01",
    name: "Bourse",
    tagline: "Low-latency limit order book in Rust",
    blurb:
      "Single-instrument matching engine with price-time priority, a length-prefixed binary protocol over TCP, write-ahead log with byte-exact replay, and a lock-free SPSC queue between the TCP gateway and the matcher core. Miri-verified for undefined behaviour on the hot path.",
    stack: "rust · tokio · miri · lock-free spsc · wal",
    year: "2026",
    repo: "https://github.com/pauti04/bourse",
    demo: "https://pauti04.github.io/bourse/",
    artifact: "bourse",
  },
  {
    index: "02",
    name: "CostDNA",
    tagline: "Behavioral GNN for AWS cost attribution",
    blurb:
      "GraphSAGE over heterogeneous service-call graphs mined from CloudTrail. Attributes spend to product features by learning behavioral edges, with an LLM function-calling agent for natural-language FinOps queries on top.",
    stack: "pytorch · graphsage · next.js · openai · aws",
    year: "2026",
    repo: "https://github.com/pauti04/CostDNA",
    demo: "https://cost-dna.vercel.app",
    artifact: "costdna",
  },
  {
    index: "03",
    name: "ChainCheck",
    tagline: "LLM hallucination detection toolkit",
    blurb:
      "Five orthogonal detectors — NLI entailment, LLM-as-judge, self-consistency, token logprobs, and QA cross-check — wrapped in a FastAPI service with a streaming SSE UI. Ensemble per use-case; works with OpenAI, Anthropic, or local models.",
    stack: "python · fastapi · nli · llms · rag",
    year: "2026",
    repo: "https://github.com/pauti04/chaincheck",
    artifact: "chaincheck",
  },
  {
    index: "04",
    name: "NetPulse",
    tagline: "Internet outage & BGP anomaly detector",
    blurb:
      "Multi-signal detector built against the real RIPE RIS archive. Reproduces YouTube/Pakistan 2008, MyEtherWallet 2018, and MainOne 2018 from a public benchmark. RPKI validation got a 500× speedup after I replaced linear lookup with longest-prefix-match indexing.",
    stack: "python · fastapi · duckdb · ripe-ris · fly.io",
    year: "2026",
    repo: "https://github.com/pauti04/netpulse",
    demo: "https://netpulse-pauti.fly.dev/",
    artifact: "netpulse",
  },
  {
    index: "05",
    name: "ChainCheck Action",
    tagline: "GitHub Action — AI-PR sanity checks",
    blurb:
      "Drop-in Action that runs hallucination detection against AI-generated PR descriptions and commit messages, blocking merges when stated claims diverge from the actual diff. Zero infra: runs inside the workflow runner.",
    stack: "python · github actions · llms",
    year: "2026",
    repo: "https://github.com/pauti04/chaincheck-action",
    artifact: "chaincheck-action",
  },
  {
    index: "06",
    name: "RasoiBot",
    tagline: "Conversational recipe assistant",
    blurb:
      "Pantry-aware recipe synthesis for Indian cooking. Turns natural-language ingredient lists into step-by-step recipes with live serving-size scaling and grocery export.",
    stack: "javascript · next.js · openai · vercel",
    year: "2025",
    repo: "https://github.com/pauti04/RasoiBot-clean",
    demo: "https://rasoi-bot-clean.vercel.app",
    artifact: "rasoibot",
  },
];

export const numbers = [
  { value: "43 µs", label: "rpki validation / call", note: "859k vrps · after 500× speedup" },
  { value: "5.7 ms", label: "route-leak scan", note: "1,000 archived as-paths" },
  { value: "39 ms", label: "feature extraction", note: "51k announces / 7.7k prefixes" },
  { value: "~1 s", label: "bundled-data demo", note: "end-to-end, no setup" },
];

export const skills = [
  { group: "languages", items: "python · rust · typescript · javascript · sql · c" },
  { group: "systems", items: "tokio · async rust · lock-free data structures · write-ahead logs · fastapi · duckdb · postgres · docker · fly.io · vercel · github actions" },
  { group: "ml / data", items: "pytorch · graph neural networks (graphsage) · llm agents · function calling · rag · nli · hallucination detection · bgp / ripe ris" },
  { group: "frontend", items: "next.js 15 · react 19 · tailwind v4 · server components" },
];

export const social = {
  github: "https://github.com/pauti04",
  email: "nikunjbhadwa123@gmail.com",
};

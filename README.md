# pauti04.dev — portfolio

Source for the portfolio at <https://pauti04.dev>.

Six live demos in-browser (BGP detector, Rust matching engine,
behavioural GNN for cloud cost, hallucination detector ensemble,
GitHub Action variant, recipe assistant), real GitHub stats, two
writeups, a printable CV, and a `⌘K` command palette over the
whole thing.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind v4 (CSS-first config in [app/globals.css](app/globals.css))
- Geist Sans / Geist Mono via Google Fonts
- No runtime dependencies beyond the framework — every demo is a
  client component with its own simulation or live WebSocket
  (NetPulse → `wss://ris-live.ripe.net`).

## Develop

```bash
npm install
npm run dev
# http://localhost:3000
```

## Build & deploy

```bash
npm run build
npm start
```

Designed for Vercel — no special configuration needed. Push the
repo and connect; the build produces static routes for `/`, `/cv`,
`/writing`, `/writing/*`, `/work/*`, and dynamic `next/og` images
plus an RSS feed at `/feed.xml`.

## Map

| Path | What |
| --- | --- |
| `/` | Single-page portfolio with all 6 demos |
| `/work/[slug]` | Deep dive per project (architecture, benchmarks, lessons) |
| `/writing` | Index of writeups |
| `/writing/[slug]` | Individual writeup |
| `/cv` | Print-ready CV |
| `/feed.xml` | RSS 2.0 of writeups |
| `/sitemap.xml` | Sitemap |
| `/robots.txt` | Robots |
| `/opengraph-image` | Dynamic 1200×630 OG image |

## Editing content

- Project metadata: [lib/data.ts](lib/data.ts)
- Project deep-dive content: [lib/project-pages.ts](lib/project-pages.ts)
- Writing registry: [lib/writing.ts](lib/writing.ts)
- Demos: [app/components/](app/components/)

## License

MIT.

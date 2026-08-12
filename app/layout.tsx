import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Spotlight from "./components/Spotlight";
import ScrollReveal from "./components/ScrollReveal";
import CursorHUD from "./components/CursorHUD";
import "./globals.css";

// pauti04.dev lapsed (Aug 2026) — flip back once the domain is re-registered
// and re-attached in Vercel.
const SITE_URL = "https://portfolio-chi-ten-5nrzbypp16.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Parth — Systems and ML, measured.",
    template: "%s — Parth · pauti04",
  },
  description:
    "Student engineer building agent reliability tooling, low-latency systems, BGP anomaly detection, and GNNs for cloud cost. Seven live demos, real benchmarks. Graduating Dec 2026 — open to new-grad SWE / ML-infra roles.",
  applicationName: "Parth · pauti04",
  authors: [{ name: "Parth", url: "https://github.com/pauti04" }],
  creator: "Parth",
  keywords: [
    "Parth",
    "pauti04",
    "portfolio",
    "systems engineer",
    "ML infrastructure",
    "Rust",
    "Python",
    "BGP",
    "matching engine",
    "GraphSAGE",
    "2026 new grad",
  ],
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    siteName: "Parth · pauti04",
    locale: "en_US",
    url: SITE_URL,
    title: "Parth — Systems and ML, measured.",
    description:
      "Live demos with real benchmarks: a flight recorder for AI agents, 220k/s matching engine, BGP anomaly detector, GraphSAGE for cloud cost. Graduating Dec 2026 — open to new-grad SWE / ML-infra roles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parth — Systems and ML, measured.",
    description:
      "Seven live demos, real benchmarks. Graduating Dec 2026 — open to new-grad SWE / ML-infra roles.",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" type="application/rss+xml" title="Parth — Writing" href="/feed.xml" />
      </head>
      <body>
        <a
          href="#cover"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-[var(--color-accent)] focus:text-[var(--color-bg)] focus:px-3 focus:py-1.5 focus:rounded-md focus:font-medium focus:text-[0.88rem]"
        >
          Skip to content
        </a>
        {children}
        <Spotlight />
        <ScrollReveal />
        <CursorHUD />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

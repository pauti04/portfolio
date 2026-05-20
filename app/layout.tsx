import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://pauti04.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Parth — Systems and ML, measured.",
    template: "%s — Parth · pauti04",
  },
  description:
    "Student engineer building low-latency systems, BGP anomaly detection, GNNs for cloud cost, and LLM tooling. Six live demos, real benchmarks. Open to 2026 SWE / ML-infra roles.",
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
      "Live demos with real benchmarks: 220k/s matching engine, BGP anomaly detector, GraphSAGE for cloud cost. Open to 2026 SWE / ML-infra roles.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parth — Systems and ML, measured.",
    description:
      "Six live demos, real benchmarks. Open to 2026 SWE / ML-infra roles.",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
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
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="alternate" type="application/rss+xml" title="Parth — Writing" href="/feed.xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}

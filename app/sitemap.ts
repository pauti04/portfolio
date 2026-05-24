import type { MetadataRoute } from "next";
import { projects } from "@/lib/data";
import { POSTS } from "@/lib/writing";

const BASE = "https://pauti04.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, priority: 1.0 },
    { url: `${BASE}/cv`, lastModified: now, priority: 0.7 },
    { url: `${BASE}/uses`, lastModified: now, priority: 0.6 },
    { url: `${BASE}/writing`, lastModified: now, priority: 0.8 },
    ...POSTS.map((p) => ({
      url: `${BASE}${p.href}`,
      lastModified: new Date(p.date + "T00:00:00Z"),
      priority: 0.7,
    })),
    ...projects.map((p) => ({
      url: `${BASE}/work/${p.artifact}`,
      lastModified: now,
      priority: 0.8,
    })),
  ];
}

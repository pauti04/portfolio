import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://portfolio-chi-ten-5nrzbypp16.vercel.app/sitemap.xml",
  };
}

import { NextResponse } from "next/server";
import { social } from "@/lib/data";

export const dynamic = "force-static";

export function GET() {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:Parth",
    "N:Parth;;;;",
    "TITLE:Student engineer — systems & ML",
    `EMAIL;TYPE=INTERNET:${social.email}`,
    `URL:${social.github}`,
    "URL:https://portfolio-chi-ten-5nrzbypp16.vercel.app",
    "NOTE:Open to 2026 new-grad SWE / ML-infra roles. Remote or relocation.",
    "END:VCARD",
    "",
  ].join("\r\n");

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="parth-pauti04.vcf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}

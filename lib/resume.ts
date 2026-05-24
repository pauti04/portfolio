// ----------------------------------------------------------------------------
// Resume data
// ----------------------------------------------------------------------------
// Fill in your real values below. Any section left as an empty array (`[]`)
// will simply not render — no placeholder text on the page.
//
// Used by:
//   - app/cv/page.tsx  (Education / Experience / Awards sections)
//   - app/page.tsx     (Hero education line if education[0] exists)
// ----------------------------------------------------------------------------

export type Education = {
  school: string;
  degree: string;
  start: string;     // "YYYY-MM"
  end: string;       // "YYYY-MM" or "Expected YYYY-MM"
  location?: string;
  gpa?: string;      // e.g. "3.9 / 4.0" — leave undefined to hide
  coursework?: string[];
  honors?: string;   // e.g. "Dean's List, 3 semesters"
};

export type Experience = {
  company: string;
  role: string;
  start: string;     // "YYYY-MM"
  end: string;       // "YYYY-MM" or "Present"
  location?: string;
  bullets: string[]; // 2-4 short, outcome-focused lines, ideally with a number
  href?: string;     // optional company URL
};

export type Award = {
  name: string;
  year: string;
  note?: string;     // optional one-sentence context
  href?: string;     // link to certificate / writeup
};

// ----------------------------------------------------------------------------
// EDUCATION
// ----------------------------------------------------------------------------
//
// Example (delete the // and fill in):
//
// export const education: Education[] = [
//   {
//     school: "Your University",
//     degree: "B.S. in Computer Science",
//     start: "2022-09",
//     end: "Expected 2026-05",
//     location: "City, State",
//     gpa: "3.9 / 4.0",                    // omit if you prefer
//     coursework: [
//       "Operating Systems",
//       "Distributed Systems",
//       "Machine Learning",
//       "Algorithms",
//       "Computer Networks",
//     ],
//     honors: "Dean's List · 4 semesters",  // omit if none
//   },
// ];
//
export const education: Education[] = [];

// ----------------------------------------------------------------------------
// EXPERIENCE
// ----------------------------------------------------------------------------
//
// Example:
//
// export const experience: Experience[] = [
//   {
//     company: "Company name",
//     role: "Software Engineering Intern",
//     start: "2025-06",
//     end: "2025-08",
//     location: "Remote / City, State",
//     href: "https://company.com",
//     bullets: [
//       "Cut p99 latency on the X service from 320ms to 84ms by replacing Y with Z.",
//       "Shipped <feature> used by N teams across the company.",
//       "Wrote a runbook now used by on-call.",
//     ],
//   },
// ];
//
export const experience: Experience[] = [];

// ----------------------------------------------------------------------------
// AWARDS / HONORS / COMPETITIONS
// ----------------------------------------------------------------------------
//
// Example:
//
// export const awards: Award[] = [
//   { name: "ACM ICPC Regional", year: "2024", note: "Top 10 of 200+ teams" },
//   { name: "HackMIT Best Systems Hack", year: "2023" },
// ];
//
export const awards: Award[] = [];

// ----------------------------------------------------------------------------
// EXTRAS — optional contact / locale bits some recruiters expect
// ----------------------------------------------------------------------------
export const extras = {
  phone: "",          // e.g. "+1 (555) 123-4567" — leave empty to hide
  location: "",       // e.g. "Bay Area, CA" — leave empty to hide
  linkedin: "",       // e.g. "linkedin.com/in/parthauti"
  languages: "",      // e.g. "English (native), Hindi (fluent)"
};

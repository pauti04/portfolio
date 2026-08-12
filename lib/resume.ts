// ----------------------------------------------------------------------------
// Resume data
// ----------------------------------------------------------------------------
// Source of truth: ~/resume/resume-2/resume.tex (Jun 2026) + master resume.
// Any section left as an empty array (`[]`) simply doesn't render.
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

export const education: Education[] = [
  {
    school: "University of North Carolina at Charlotte",
    degree: "B.S. in Computer Science",
    start: "2025-08",
    end: "Expected Dec 2026",
    location: "Charlotte, NC",
    gpa: "3.7 / 4.0",
    coursework: [
      "Machine Learning",
      "Deep Learning",
      "Data Mining",
      "Operating Systems",
      "Computer Networks",
      "Database Systems",
      "Cloud Computing",
      "Data Structures & Algorithms",
    ],
    honors: "Chancellor's List (Spring 2026) · Dean's List (Fall 2025)",
  },
  {
    school: "Manipal Academy of Higher Education (MAHE)",
    degree: "Computer Science (transferred to UNC Charlotte)",
    start: "2023-08",
    end: "2025-05",
    location: "Manipal, India",
    gpa: "3.63 / 4.0",
  },
];

export const experience: Experience[] = [
  {
    company: "Charlotte Machine Learning Lab (CharmLab)",
    role: "Undergraduate Researcher",
    start: "2026-05",
    end: "Present",
    location: "UNC Charlotte — advised by Prof. Minwoo Lee",
    bullets: [
      "Extending ChainCheck's NLI/judge ensemble to study LLM judge reliability under framing bias and reference-knowledge conflicts as per-claim failure modes.",
      "Designing experiments to test whether NLI/judge disagreement predicts framing-bias failures on HaluEval-QA (n=500).",
    ],
  },
  {
    company: "Starbucks",
    role: "Barista → Barista Trainer (promoted)",
    start: "2025-10",
    end: "2026-04",
    location: "Charlotte, NC",
    bullets: [
      "Promoted to Trainer ahead of standard tenure; onboarded and trained new hires on beverage standards, POS, and food safety.",
      "Operated the bar through 200+-transaction morning rushes — while carrying a full CS course load.",
    ],
  },
  {
    company: "MIT Manipal — Dept. of Computer Science & Engineering",
    role: "Undergraduate Research Assistant",
    start: "2024",
    end: "2025",
    location: "Manipal, India — advisors: Dr. Nagaraj Naik & Arti Pawar",
    bullets: [
      "Assisted research on time-series/statistical ML and on ML for medical imaging — multiclass brain-tumor classification on MRI scans.",
      "Ran baseline experiments in PyTorch and scikit-learn; supported data collection, preprocessing, and result tabulation for ongoing journal and conference work.",
    ],
  },
  {
    company: "Manipal Academy of Higher Education",
    role: "IT Support Assistant",
    start: "2023-12",
    end: "2025-05",
    location: "Manipal, India",
    bullets: [
      "Resolved 500+ tier-1/tier-2 helpdesk tickets (Windows/macOS, networking, account access, classroom AV) for students and faculty.",
      "Authored internal knowledge-base docs that cut average resolution time for repeat issues.",
    ],
  },
];

export const awards: Award[] = [
  {
    name: "Chancellor's List, UNC Charlotte",
    year: "2026",
    note: "Spring 2026",
  },
  {
    name: "Dean's List, UNC Charlotte",
    year: "2025",
    note: "Fall 2025",
  },
  {
    name: "Smart India Hackathon — 3rd Place (MAHE)",
    year: "2024",
    note: "IoT precision-agriculture system: ESP32 sensor nodes, Firebase, ML irrigation recommendations, GSM/SMS alerts for low-connectivity rural areas",
  },
  {
    name: "JEE Advanced 2023 — qualified",
    year: "2023",
    note: "Ranked in the top ~1.3% of 1.4M+ candidates (India's national engineering entrance exam)",
  },
  {
    name: "Oracle Cloud Infrastructure (OCI) Foundations",
    year: "2024",
    note: "Certification",
  },
];

// ----------------------------------------------------------------------------
// EXTRAS — optional contact / locale bits some recruiters expect
// ----------------------------------------------------------------------------
export const extras = {
  phone: "",          // kept off the public site — it's on the PDF resume
  location: "Charlotte, NC",
  linkedin: "linkedin.com/in/parthauti",
  languages: "English (professional) · Hindi (native) · Marathi (conversational)",
};

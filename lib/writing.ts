export type Post = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  date: string;
  minutes: number;
  tags: string[];
};

export const POSTS: Post[] = [
  {
    slug: "fifteen-green-runs",
    href: "/writing/fifteen-green-runs",
    title: "Fifteen green runs booked a meeting on a Sunday",
    summary:
      "A live scheduling agent passed every tool-level check fifteen times in a row — and was wrong every time. Why pass rates lie, LLM judges flake, and a 15-line assertion on a recording beats both.",
    date: "2026-08-11",
    minutes: 6,
    tags: ["Reflight", "agents", "evals", "reliability"],
  },
  {
    slug: "netpulse-rpki-trie",
    href: "/writing/netpulse-rpki-trie",
    title: "How a patricia trie made RPKI validation 500× faster",
    summary:
      "The single change that took NetPulse from offline batch tool to live stream detector. A worked example of data-structure choice mattering more than language.",
    date: "2026-05-12",
    minutes: 5,
    tags: ["NetPulse", "BGP", "Python", "performance"],
  },
];

export const byNewest = () =>
  [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

export const findPost = (slug: string) => POSTS.find((p) => p.slug === slug);

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

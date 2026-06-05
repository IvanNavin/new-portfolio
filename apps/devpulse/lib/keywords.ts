/**
 * Personal interest map. Items whose title or excerpt match any of these
 * terms get bonus score and surface higher within their day bucket.
 *
 * Editing rule: keep terms lowercase. Multi-word terms match as substrings
 * (case-insensitive). Be specific — `react` would match every React-adjacent
 * post and lose all signal; `react 19` or `react server` carry meaning.
 *
 * Bump `weight` when something becomes the focus of the week.
 */
export type KeywordBoost = {
  label: string;
  terms: string[];
  weight: number;
};

export const KEYWORD_BOOSTS: KeywordBoost[] = [
  // Next.js & React surface I follow closely
  {
    label: "cache-components",
    terms: ["cache components", "use cache", "cachelife", "cachetag"],
    weight: 5,
  },
  {
    label: "server-actions",
    terms: ["server actions", "server action"],
    weight: 4,
  },
  {
    label: "server-components",
    terms: ["server components", "rsc "],
    weight: 4,
  },
  {
    label: "react-19",
    terms: ["react 19", "react 20", "react canary", "react compiler"],
    weight: 4,
  },
  {
    label: "next-16",
    terms: ["next 16", "next.js 16", "next 17", "next.js 17"],
    weight: 4,
  },
  {
    label: "turbopack",
    terms: ["turbopack"],
    weight: 3,
  },
  {
    label: "middleware",
    terms: ["routing middleware", "edge middleware"],
    weight: 3,
  },

  // Browser features that change daily work
  {
    label: "view-transitions",
    terms: ["view transitions", "view-transition"],
    weight: 5,
  },
  {
    label: "container-queries",
    terms: ["container queries", "@container"],
    weight: 4,
  },
  {
    label: "css-has",
    terms: [":has(", "has() selector"],
    weight: 3,
  },
  {
    label: "tailwind-4",
    terms: ["tailwind 4", "tailwind v4", "tailwind css 4"],
    weight: 4,
  },
  {
    label: "baseline",
    terms: ["baseline 2025", "baseline 2026", "newly available"],
    weight: 3,
  },

  // Toolchain shifts
  {
    label: "bun-1",
    terms: ["bun 1.", "bun release"],
    weight: 3,
  },
  {
    label: "prisma",
    terms: ["prisma 6", "prisma 7"],
    weight: 3,
  },
  {
    label: "typescript-5",
    terms: ["typescript 5.", "typescript 6"],
    weight: 4,
  },
];

export type Category =
  | "framework"
  | "language"
  | "browser"
  | "tooling"
  | "runtime"
  | "platform"
  | "community";

export type Source = {
  name: string;
  url: string;
  category: Category;
  /**
   * Importance score, 1–10. Used by lib/score.ts as the base for sort.
   * 10 = my critical daily-stack (Next, React, TS).
   * 7–8 = secondary daily-stack & platforms I ship on.
   *  5–6 = libs I use but rarely care about minor updates of.
   *  3–4 = adjacent stuff, peripheral interest.
   * Defaults to 5 when omitted.
   */
  weight?: number;
  /** Hint for the parser when both formats are technically valid; usually auto-detected. */
  format?: "atom" | "rss";
};

/**
 * Curated feeds aimed at the stack Ivan actually ships with:
 * Next.js / React / Tailwind / TypeScript / Prisma / Vite / Bun
 * plus the platforms (Vercel, Node) and browsers that move the floor.
 *
 * Used ONLY to seed the devpulse_source table on first cron run via
 * lib/sourcesDb.ts. Once seeded, the DB is the source of truth — adding
 * a feed at runtime happens through /settings (per-user), not by editing
 * this file. Edit here if you want to change the curated baseline for
 * brand-new users (existing users keep their toggled state).
 */
export const SEED_SOURCES: Source[] = [
  // Frameworks & UI libraries
  {
    name: "Next.js Blog",
    url: "https://nextjs.org/feed.xml",
    category: "framework",
    weight: 10,
  },
  {
    name: "React Releases",
    url: "https://github.com/facebook/react/releases.atom",
    category: "framework",
    weight: 10,
  },
  {
    name: "Next.js Releases",
    url: "https://github.com/vercel/next.js/releases.atom",
    category: "framework",
    weight: 10,
  },
  {
    name: "Tailwind Blog",
    url: "https://tailwindcss.com/feeds/feed.xml",
    category: "framework",
    weight: 8,
  },
  {
    name: "Tailwind Releases",
    url: "https://github.com/tailwindlabs/tailwindcss/releases.atom",
    category: "framework",
    weight: 8,
  },
  {
    name: "Mantine Releases",
    url: "https://github.com/mantinedev/mantine/releases.atom",
    category: "framework",
    weight: 6,
  },
  {
    name: "Framer Motion Releases",
    url: "https://github.com/motiondivision/motion/releases.atom",
    category: "framework",
    weight: 6,
  },
  {
    name: "Astro Blog",
    url: "https://astro.build/rss.xml",
    category: "framework",
    weight: 4,
  },

  // Language & types
  {
    name: "TypeScript Blog",
    url: "https://devblogs.microsoft.com/typescript/feed/",
    category: "language",
    weight: 10,
  },
  {
    name: "TypeScript Releases",
    url: "https://github.com/microsoft/TypeScript/releases.atom",
    category: "language",
    weight: 9,
  },

  // Browsers & standards
  {
    name: "web.dev",
    url: "https://web.dev/static/blog/feed.xml",
    category: "browser",
    weight: 8,
  },
  {
    name: "Chrome for Developers",
    url: "https://developer.chrome.com/static/blog/feed.xml",
    category: "browser",
    weight: 7,
  },
  {
    name: "WebKit Blog",
    url: "https://webkit.org/feed/",
    category: "browser",
    weight: 6,
  },
  {
    name: "Mozilla Hacks",
    url: "https://hacks.mozilla.org/feed/",
    category: "browser",
    weight: 6,
  },
  {
    name: "V8 Blog",
    url: "https://v8.dev/blog.atom",
    category: "browser",
    weight: 5,
  },
  {
    name: "MDN Blog",
    url: "https://developer.mozilla.org/en-US/blog/rss.xml",
    category: "browser",
    weight: 7,
  },

  // Tooling
  {
    name: "Vite Releases",
    url: "https://github.com/vitejs/vite/releases.atom",
    category: "tooling",
    weight: 7,
  },
  {
    name: "Prisma Releases",
    url: "https://github.com/prisma/prisma/releases.atom",
    category: "tooling",
    weight: 7,
  },
  {
    name: "Turborepo Releases",
    url: "https://github.com/vercel/turborepo/releases.atom",
    category: "tooling",
    weight: 6,
  },
  {
    name: "GSAP Releases",
    url: "https://github.com/greensock/GSAP/releases.atom",
    category: "tooling",
    weight: 5,
  },
  {
    name: "cmdk Releases",
    url: "https://github.com/pacocoursey/cmdk/releases.atom",
    category: "tooling",
    weight: 5,
  },
  {
    name: "Sass Releases",
    url: "https://github.com/sass/dart-sass/releases.atom",
    category: "tooling",
    weight: 4,
  },
  {
    name: "i18next Releases",
    url: "https://github.com/i18next/i18next/releases.atom",
    category: "tooling",
    weight: 5,
  },

  // Runtimes
  {
    name: "Bun Blog",
    url: "https://bun.com/rss.xml",
    category: "runtime",
    weight: 6,
  },
  {
    name: "Deno News",
    url: "https://deno.com/feed",
    category: "runtime",
    weight: 5,
  },
  {
    name: "Node.js Releases",
    url: "https://github.com/nodejs/node/releases.atom",
    category: "runtime",
    weight: 7,
  },

  // Platforms
  {
    name: "Vercel Changelog",
    url: "https://vercel.com/atom",
    category: "platform",
    weight: 8,
  },

  // Community discovery — filtered to high-signal threads so they don't drown
  // out the authoritative changelogs. hnrss.org gates by point count, Lobsters
  // by tag — both surface things the curated list would miss.
  {
    name: "Hacker News (top)",
    url: "https://hnrss.org/frontpage?points=200",
    category: "community",
    weight: 4,
  },
  {
    name: "Lobsters: javascript",
    url: "https://lobste.rs/t/javascript.rss",
    category: "community",
    weight: 4,
  },
  {
    name: "Lobsters: web",
    url: "https://lobste.rs/t/web.rss",
    category: "community",
    weight: 4,
  },
  {
    name: "Lobsters: css",
    url: "https://lobste.rs/t/css.rss",
    category: "community",
    weight: 3,
  },
];

export const DEFAULT_SOURCE_WEIGHT = 5;

export const CATEGORY_LABELS: Record<Category, string> = {
  framework: "Frameworks",
  language: "Language",
  browser: "Browsers",
  tooling: "Tooling",
  runtime: "Runtimes",
  platform: "Platforms",
  community: "Community",
};

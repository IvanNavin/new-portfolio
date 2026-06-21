import type { TFunction } from "i18next";
import type { Ring } from "./AnimatedRing";
import type { CareerEntry } from "./CareerTimeline";

// Ivan started at Evoplay in October 2018. Count full years since then (not the
// calendar-year delta) — full N years lands in October.
const CAREER_START = new Date(2018, 9, 1);
const monthsSinceStart = (() => {
  const now = new Date();
  return (
    (now.getFullYear() - CAREER_START.getFullYear()) * 12 +
    (now.getMonth() - CAREER_START.getMonth())
  );
})();
export const yearsOfExperience = Math.max(0, Math.floor(monthsSinceStart / 12));

type CareerMeta = {
  id: string;
  company: string;
  workModeKey?: "remote" | "onSite" | "hybrid";
  isCurrent?: boolean;
  stack: string[];
  avatarGradient?: string;
  hasCompanySubtitle?: boolean;
};

// Most-recent-first (top of timeline = current role).
const CAREER_META: CareerMeta[] = [
  {
    id: "illusionsOnlineArabia",
    company: "Illusions Online Arabia",
    workModeKey: "remote",
    isCurrent: true,
    avatarGradient: "from-red-500/80 to-orange-500/80",
    stack: [
      "Next.js",
      "TypeScript",
      "Zustand",
      "TanStack Query/Table",
      "i18n",
      "Yup",
      "Tailwind",
      "Turborepo",
    ],
  },
  {
    id: "worktechLabs",
    company: "Worktech Labs",
    workModeKey: "remote",
    avatarGradient: "from-purple-500/80 to-pink-500/80",
    stack: ["Next.js", "NextAuth", "Mantine", "Zustand", "Zod", "Ramda"],
  },
  {
    id: "octalSecurity",
    company: "Octal Security",
    workModeKey: "remote",
    avatarGradient: "from-orange-600/80 to-red-600/80",
    stack: [
      "React",
      "TypeScript",
      "Redux Toolkit Query",
      "React Hook Form",
      "MSAL React",
      "Material UI",
      "Jest",
    ],
  },
  {
    id: "luxoft",
    company: "Luxoft",
    workModeKey: "remote",
    avatarGradient: "from-blue-500/80 to-indigo-600/80",
    stack: [
      "React",
      "Redux",
      "Thunk",
      "TypeScript",
      "Jest",
      "AG Grid React",
      "Flexlayout-react",
    ],
  },
  {
    id: "evoplay",
    company: "Evoplay",
    workModeKey: "onSite",
    hasCompanySubtitle: true,
    avatarGradient: "from-amber-500/80 to-orange-600/80",
    stack: [
      "React",
      "TypeScript",
      "ESLint",
      "GraphQL",
      "Sass",
      "Twig",
      "jQuery",
      "Less",
    ],
  },
];

export const buildAchievementRings = (t: TFunction): Ring[] => [
  {
    label: t("about.rings.experience"),
    value: yearsOfExperience,
    max: 10,
    suffix: "+",
    numberClass: "text-yellow-300",
    stroke: "#fde047",
  },
  {
    label: t("about.rings.technologies"),
    value: 42,
    max: 60,
    suffix: "+",
    numberClass: "text-sky-300",
    stroke: "#7dd3fc",
  },
  {
    label: t("about.rings.projects"),
    value: 25,
    max: 30,
    suffix: "+",
    numberClass: "text-emerald-300",
    stroke: "#6ee7b7",
  },
  {
    label: t("about.rings.mentored"),
    value: 5,
    max: 10,
    numberClass: "text-pink-300",
    stroke: "#f9a8d4",
  },
];

export const buildCareerTimeline = (t: TFunction): CareerEntry[] =>
  CAREER_META.map((meta) => {
    const base = `about.career.${meta.id}`;
    // Before i18n resources load, returnObjects yields the key string, not an
    // array — fall back to [] so downstream .map() can't crash.
    const rawBullets = t(`${base}.bullets`, { returnObjects: true });
    const bullets = Array.isArray(rawBullets) ? (rawBullets as string[]) : [];
    return {
      company: meta.company,
      role: t(`${base}.role`),
      period: t(`${base}.period`),
      location: t(`${base}.location`),
      workMode: meta.workModeKey
        ? t(`about.workMode.${meta.workModeKey}`)
        : undefined,
      bullets,
      stack: meta.stack,
      isCurrent: meta.isCurrent,
      avatarGradient: meta.avatarGradient,
      ...(meta.hasCompanySubtitle && {
        companySubtitle: t(`${base}.companySubtitle`),
      }),
    };
  });

export const htmlSkills = [
  "HTML",
  "Accessibility",
  "Bootstrap",
  "Material Ui",
  "Mantine Ui",
  "Semantic Ui",
  "Ant Design Ui",
  "Twig",
  "Pug",
];
export const cssSkills = ["Css", "Scss", "Sass", "Less", "Tailwind Css"];
export const JSSkills = [
  "JavaScript",
  "JQuery",
  "Node.js",
  "React",
  "Redux",
  "Thunk",
  "Redux Toolkit Query",
  "Zustand",
  "Tanstack Query & Table",
  "TypeScript",
  "Next.js",
  "React Router v7 / Remix",
  "Service Worker",
  "PWA",
  "AMPS",
  "Lodash",
  "Ramda.js",
  "AGGrid",
  "GraphQL",
  "Socket.io",
];
export const otherSkills = [
  "Vite",
  "Webpack",
  "GraphQL",
  "Jest",
  "Gulp",
  "EsLint",
  "Prettier",
  "DataDog",
];

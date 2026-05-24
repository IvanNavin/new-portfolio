import type { Ring } from './AchievementRings';
import type { CareerEntry } from './CareerTimeline';

// Ivan started at Evoplay in October 2018. Counting full years since then,
// not just the calendar-year delta — otherwise we'd jump to 8+ on Jan 1, 2026
// even though he only hits 8 years in October 2026.
const CAREER_START = new Date(2018, 9, 1); // October = month index 9.
const monthsSinceStart = (() => {
  const now = new Date();
  return (
    (now.getFullYear() - CAREER_START.getFullYear()) * 12 +
    (now.getMonth() - CAREER_START.getMonth())
  );
})();
const yearsOfExperience = Math.max(0, Math.floor(monthsSinceStart / 12));

export const achievementRings: Ring[] = [
  {
    label: 'Experience',
    value: yearsOfExperience,
    max: 10,
    suffix: '+',
    numberClass: 'text-yellow-300',
    stroke: '#fde047',
  },
  {
    label: 'Technologies',
    value: 42,
    max: 60,
    suffix: '+',
    numberClass: 'text-sky-300',
    stroke: '#7dd3fc',
  },
  {
    label: 'Projects',
    value: 25,
    max: 30,
    suffix: '+',
    numberClass: 'text-emerald-300',
    stroke: '#6ee7b7',
  },
  {
    label: 'Mentored',
    value: 5,
    max: 10,
    numberClass: 'text-pink-300',
    stroke: '#f9a8d4',
  },
];

// Order is most-recent-first (top of timeline = current role).
export const careerTimeline: CareerEntry[] = [
  {
    period: 'Aug 2023 — Present',
    role: 'Senior React Engineer',
    company: 'Illusions Online Arabia',
    location: 'Dubai, UAE',
    workMode: 'Remote',
    isCurrent: true,
    avatarGradient: 'from-red-500/80 to-orange-500/80',
    bullets: [
      'Set up a Turborepo monorepo with 10 packages and 4 Next.js apps.',
      'Built and maintained a 60+ component UI library adopted by 4 internal teams.',
      'Implemented i18n with namespaces across apps.',
      'Added ARIA roles, focus management and keyboard navigation across core flows.',
      'Configured Docker, ran Azure DevOps releases.',
    ],
    stack: [
      'Next.js',
      'TypeScript',
      'Zustand',
      'TanStack Query/Table',
      'i18n',
      'Yup',
      'Tailwind',
      'Turborepo',
    ],
  },
  {
    period: 'Mar 2023 — Aug 2023',
    role: 'Senior React Engineer',
    company: 'Worktech Labs',
    location: 'Stockholm, Sweden',
    workMode: 'Remote',
    avatarGradient: 'from-purple-500/80 to-pink-500/80',
    bullets: [
      'Delivered features and UX fixes in a Next.js product during a 5-month contract.',
      'Added authentication with NextAuth (credentials).',
      'Collaborated with design and backend to close high-impact UX issues.',
    ],
    stack: ['Next.js', 'NextAuth', 'Mantine', 'Zustand', 'Zod', 'Ramda'],
  },
  {
    period: 'Feb 2022 — Mar 2023',
    role: 'Senior React Engineer',
    company: 'Octal Security',
    location: 'Kyiv, Ukraine',
    workMode: 'Remote',
    avatarGradient: 'from-orange-600/80 to-red-600/80',
    bullets: [
      'Shipped a production admin project in 13 months: 38 pages, 8 tables, 16 create/edit pages.',
      'Implemented MSAL React auth and React Hook Form.',
      'Wrote unit tests with Jest on core modules.',
    ],
    stack: [
      'React',
      'TypeScript',
      'Redux Toolkit Query',
      'React Hook Form',
      'MSAL React',
      'Material UI',
      'Jest',
    ],
  },
  {
    period: 'Apr 2021 — Mar 2022',
    role: 'Middle React Engineer',
    company: 'Luxoft',
    location: 'Kyiv, Ukraine',
    workMode: 'Remote',
    avatarGradient: 'from-blue-500/80 to-indigo-600/80',
    bullets: [
      'Built trading dashboards for Citi with real-time AG Grid.',
      'Automated in-product Excel file processing.',
      'Built complex AG Grid views with saved layouts, tabs, and resizable panes using flexlayout-react.',
      'Raised test coverage above 50% with Jest.',
    ],
    stack: [
      'React',
      'Redux',
      'Thunk',
      'TypeScript',
      'Jest',
      'AG Grid React',
      'Flexlayout-react',
    ],
  },
  {
    period: 'Oct 2018 — Apr 2021',
    role: 'Frontend Engineer',
    company: 'Evoplay',
    companySubtitle: 'Online Gambling (iGaming)',
    location: 'Kyiv, Ukraine',
    workMode: 'On-site',
    avatarGradient: 'from-amber-500/80 to-orange-600/80',
    bullets: [
      'Shipped 10 projects (React, TS, GraphQL, Sass) and 5 projects (Twig, JS, jQuery, Less) with shared components and different themes.',
      'Extensive CSS and canvas animations.',
      'Mentored 4 junior engineers who later progressed to mid/senior roles.',
    ],
    stack: [
      'React',
      'TypeScript',
      'ESLint',
      'GraphQL',
      'Sass',
      'Twig',
      'jQuery',
      'Less',
    ],
  },
];

export const htmlSkills = [
  'HTML',
  'Accessibility',
  'Bootstrap',
  'Material Ui',
  'Mantine Ui',
  'Semantic Ui',
  'Ant Design Ui',
  'Twig',
  'Pug',
];
export const cssSkills = ['Css', 'Scss', 'Sass', 'Less', 'Tailwind Css'];
export const JSSkills = [
  'JavaScript',
  'JQuery',
  'Node.js',
  'React',
  'Redux',
  'Thunk',
  'Redux Toolkit Query',
  'Zustand',
  'Tanstack Query & Table',
  'TypeScript',
  'Next.js',
  'React Router v7 / Remix',
  'Service Worker',
  'PWA',
  'AMPS',
  'Lodash',
  'Ramda.js',
  'AGGrid',
  'GraphQL',
  'Socket.io',
];
export const otherSkills = [
  'Vite',
  'Webpack',
  'GraphQL',
  'Jest',
  'Gulp',
  'EsLint',
  'Prettier',
  'DataDog',
];

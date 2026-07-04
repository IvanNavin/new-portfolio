// Ported from the old portfolio's my-works section. Every project is deployed
// elsewhere and shown via an embed (iframe / video / image) on its detail page;
// the grid is a filterable set of flip cards.

import PORTFOLIO from "@/assets/img/portfolio.png";
import SOLITAIRE_FRONT from "@/assets/img/solitaireFront.png";
import SNAKE_FRONT from "@/assets/img/snake-front.png";
import SNAKE_BACK from "@/assets/img/snake-back.png";
import GAME_2048 from "@/assets/img/2048.png";
import FRONT_MINER from "@/assets/img/minerFront.png";
import BACK_MINER from "@/assets/img/minerBack.png";
import RPG from "@/assets/img/RPG.png";
import RPG_GAME from "@/assets/img/RPG-GAME.png";
import GANTT_CHART_FRONT from "@/assets/img/ganttChartFront.png";
import GANTT_CHART_BACK from "@/assets/img/ganttChartBack.png";
import POKEDEX_HOME from "@/assets/img/pokedex-home.png";
import POKEDEX_DESKTOP from "@/assets/img/pokedex-desktop.png";
import ENGLISH from "@/assets/img/English.png";
import THANOS from "@/assets/img/thanos.jpg";
import THANOS_BACK from "@/assets/img/thanos-back.jpeg";
import DEVPULSE_FRONT from "@/assets/img/devpulseFront.png";

// `enum` is disallowed under erasableSyntaxOnly, so these are const maps that
// double as a value (EWorkType.Game) and a type (EWorkType).
export const EWorkType = {
  Game: "Game",
  Education: "Education",
  Productivity: "Productivity",
  Portfolio: "Portfolio",
  VisualEffect: "VisualEffect",
} as const;
export type EWorkType = (typeof EWorkType)[keyof typeof EWorkType];

export const ESkill = {
  React: "React",
  NextJS: "Next.js",
  TypeScript: "TypeScript",
  Tailwind: "Tailwind",
  Sass: "Sass",
  Prisma: "Prisma",
  Mantine: "Mantine UI",
  NextAuth: "NextAuth",
  GoogleOneTap: "Google One Tap",
  HTML: "HTML",
  CSS: "CSS",
  JavaScript: "JavaScript",
  ReduxToolkit: "Redux Toolkit",
  ReactDatepicker: "React Datepicker",
  ReactHookForm: "React Hook Form",
  MaterialUI: "Material UI",
  TurboRepo: "TurboRepo",
  GSAP: "GSAP",
  ReactI18Next: "React i18next",
  Vite: "Vite",
  FramerMotion: "Framer Motion",
  ThreeFiber: "React Three Fiber",
  WebGL: "WebGL",
  Canvas: "Canvas",
  Node: "Node",
  Hapi: "Hapi",
  SocketIO: "Socket.io",
  Chat: "Chat",
  Yup: "Yup",
  AISDK: "Vercel AI SDK",
  Gemini: "Google Gemini",
  Zod: "Zod",
} as const;
export type ESkill = (typeof ESkill)[keyof typeof ESkill];

/** How a project is shown on its detail page. */
export type WorkEmbed =
  | { type: "iframe"; src: string }
  | { type: "video"; src: string }
  | { type: "image"; src: string };

export type Work = {
  id: string;
  name: string;
  status?: string;
  workType: EWorkType[];
  stack: ESkill[];
  frontPicture: string;
  backPicture?: string;
  embed: WorkEmbed;
  liveUrl?: string;
  codeUrl: string;
};

export const workTypeOptions: { label: string; value: EWorkType }[] = [
  { label: "Education", value: EWorkType.Education },
  { label: "Game", value: EWorkType.Game },
  { label: "Productivity", value: EWorkType.Productivity },
  { label: "Portfolio", value: EWorkType.Portfolio },
  { label: "Visual Effect", value: EWorkType.VisualEffect },
];

export const WORKS: Work[] = [
  {
    id: "portfolio",
    name: "Portfolio",
    workType: [EWorkType.Portfolio, EWorkType.VisualEffect],
    stack: [
      ESkill.Vite,
      ESkill.React,
      ESkill.TypeScript,
      ESkill.Tailwind,
      ESkill.FramerMotion,
      ESkill.ThreeFiber,
      ESkill.WebGL,
      ESkill.GSAP,
      ESkill.ReactI18Next,
    ],
    frontPicture: PORTFOLIO,
    embed: { type: "image", src: PORTFOLIO },
    codeUrl: "https://github.com/IvanNavin/new-portfolio",
  },
  {
    id: "devpulse",
    name: "DevPulse",
    status: "2026",
    workType: [EWorkType.Productivity],
    stack: [
      ESkill.NextJS,
      ESkill.React,
      ESkill.TypeScript,
      ESkill.Tailwind,
      ESkill.Prisma,
      ESkill.NextAuth,
      ESkill.AISDK,
      ESkill.Gemini,
      ESkill.Zod,
    ],
    frontPicture: DEVPULSE_FRONT,
    embed: { type: "iframe", src: "https://devpulse-two-swart.vercel.app/" },
    liveUrl: "https://devpulse-two-swart.vercel.app/",
    codeUrl:
      "https://github.com/IvanNavin/new-portfolio/tree/main/apps/devpulse",
  },
  {
    id: "solitaire",
    name: "Solitaire",
    status: "2025",
    workType: [EWorkType.Game, EWorkType.VisualEffect],
    stack: [ESkill.HTML, ESkill.CSS, ESkill.JavaScript, ESkill.Canvas],
    frontPicture: SOLITAIRE_FRONT,
    embed: { type: "iframe", src: "https://solitare-native.netlify.app/" },
    liveUrl: "https://solitare-native.netlify.app/",
    codeUrl:
      "https://github.com/IvanNavin/new-portfolio/tree/main/apps/solitaire",
  },
  {
    id: "snake",
    name: "Snake",
    status: "2025",
    workType: [EWorkType.Game, EWorkType.VisualEffect],
    stack: [ESkill.HTML, ESkill.CSS, ESkill.JavaScript],
    frontPicture: SNAKE_FRONT,
    backPicture: SNAKE_BACK,
    embed: { type: "iframe", src: "https://snake-native.netlify.app/" },
    liveUrl: "https://snake-native.netlify.app/",
    codeUrl: "https://github.com/IvanNavin/new-portfolio/tree/main/apps/snake",
  },
  {
    id: "2048",
    name: "2048",
    status: "2023",
    workType: [EWorkType.Game, EWorkType.VisualEffect],
    stack: [ESkill.HTML, ESkill.CSS, ESkill.JavaScript],
    frontPicture: GAME_2048,
    embed: { type: "iframe", src: "https://2048-native.netlify.app/" },
    liveUrl: "https://2048-native.netlify.app/",
    codeUrl: "https://github.com/IvanNavin/new-portfolio/tree/main/apps/2048",
  },
  {
    id: "miner",
    name: "Miner",
    status: "2023",
    workType: [EWorkType.Game],
    stack: [ESkill.HTML, ESkill.CSS, ESkill.JavaScript],
    frontPicture: FRONT_MINER,
    backPicture: BACK_MINER,
    embed: { type: "iframe", src: "https://miner-native.netlify.app/" },
    liveUrl: "https://miner-native.netlify.app/",
    codeUrl: "https://github.com/IvanNavin/new-portfolio/tree/main/apps/miner",
  },
  {
    id: "rpg",
    name: "RPG Online Game",
    status: "2022",
    workType: [EWorkType.Game, EWorkType.VisualEffect],
    stack: [
      ESkill.HTML,
      ESkill.CSS,
      ESkill.JavaScript,
      ESkill.Canvas,
      ESkill.Node,
      ESkill.Hapi,
      ESkill.SocketIO,
      ESkill.Chat,
    ],
    frontPicture: RPG,
    backPicture: RPG_GAME,
    embed: { type: "video", src: "/video/game_js_pro.mp4" },
    liveUrl: "https://rpg-game-b89w.onrender.com",
    codeUrl:
      "https://github.com/IvanNavin/new-portfolio/tree/main/apps/rpg-game",
  },
  {
    id: "gantt-chart",
    name: "Gantt Chart",
    status: "2022",
    workType: [EWorkType.Productivity],
    stack: [
      ESkill.React,
      ESkill.TypeScript,
      ESkill.ReduxToolkit,
      ESkill.ReactDatepicker,
      ESkill.Sass,
      ESkill.ReactHookForm,
      ESkill.MaterialUI,
      ESkill.Yup,
    ],
    frontPicture: GANTT_CHART_FRONT,
    backPicture: GANTT_CHART_BACK,
    embed: { type: "iframe", src: "https://gantt-chart-test.vercel.app/" },
    liveUrl: "https://gantt-chart-test.vercel.app/",
    codeUrl:
      "https://github.com/IvanNavin/new-portfolio/tree/main/apps/gantt-chart",
  },
  {
    id: "pokedex",
    name: "Pokedex",
    status: "2021",
    workType: [EWorkType.Education],
    stack: [
      ESkill.NextJS,
      ESkill.React,
      ESkill.Prisma,
      ESkill.Mantine,
      ESkill.TypeScript,
      ESkill.Sass,
    ],
    frontPicture: POKEDEX_HOME,
    backPicture: POKEDEX_DESKTOP,
    embed: { type: "iframe", src: "https://pokedex-pedia.vercel.app/pokedex" },
    liveUrl: "https://pokedex-pedia.vercel.app",
    codeUrl:
      "https://github.com/IvanNavin/new-portfolio/tree/main/apps/pokedex",
  },
  {
    id: "english-learn",
    name: "English learn",
    status: "2020",
    workType: [EWorkType.Education],
    stack: [
      ESkill.NextJS,
      ESkill.React,
      ESkill.NextAuth,
      ESkill.Prisma,
      ESkill.TypeScript,
      ESkill.Tailwind,
      ESkill.Sass,
      ESkill.GoogleOneTap,
    ],
    frontPicture: ENGLISH,
    embed: { type: "iframe", src: "https://my-learning-language.vercel.app/" },
    liveUrl: "https://my-learning-language.vercel.app/",
    codeUrl:
      "https://github.com/IvanNavin/new-portfolio/tree/main/apps/language",
  },
  {
    id: "thanos-effect",
    name: "Thanos Effect",
    status: "2019",
    workType: [EWorkType.VisualEffect],
    stack: [ESkill.HTML, ESkill.CSS, ESkill.JavaScript, ESkill.Canvas],
    frontPicture: THANOS,
    backPicture: THANOS_BACK,
    embed: { type: "iframe", src: "https://thanos-effect.netlify.app/" },
    liveUrl: "https://thanos-effect.netlify.app/",
    codeUrl:
      "https://github.com/IvanNavin/new-portfolio/tree/main/apps/destructurizator",
  },
];

export const findWork = (id: string): Work | undefined =>
  WORKS.find((w) => w.id === id);

export const isWorkId = (id: string): boolean => WORKS.some((w) => w.id === id);

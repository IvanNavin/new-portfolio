import { ROUTES } from '@app/constants/routes';
import ENGLISH from '@assets/img/English.png';
import GANTT_CHART_BACK from '@assets/img/ganttChartBack.png';
import GANTT_CHART_FRONT from '@assets/img/ganttChartFront.png';
import BACK_MINER from '@assets/img/minerBack.png';
import FRONT_MINER from '@assets/img/minerFront.png';
import POKEDEX_DESKTOP from '@assets/img/pokedex-desktop.png';
import POKEDEX_HOME from '@assets/img/pokedex-home.png';
import PORTFOLIO from '@assets/img/portfolio.png';
import RPG from '@assets/img/RPG.png';
import RPG_GAME from '@assets/img/RPG-GAME.png';
import SNAKE_BACK from '@assets/img/snake-back.png';
import SNAKE_FRONT from '@assets/img/snake-front.png';
import SOLITAIRE_FRONT from '@assets/img/solitaireFront.png';
import THANOS from '@assets/img/thanos.jpg';
import THANOS_BACK from '@assets/img/thanos-back.jpeg';
import { Locale } from '@root/i18n-config';

import { ESkill, EWorkType, Work } from './types';

export const workTypeOptions: { label: string; value: EWorkType | 'all' }[] = [
  { label: 'Education', value: EWorkType.Education },
  { label: 'Game', value: EWorkType.Game },
  { label: 'Productivity', value: EWorkType.Productivity },
  { label: 'Portfolio', value: EWorkType.Portfolio },
  { label: 'Visual Effect', value: EWorkType.VisualEffect },
];

export const getWorks = (lang: Locale): Work[] => [
  {
    id: 'portfolio',
    name: 'Portfolio',
    workType: [EWorkType.Portfolio, EWorkType.VisualEffect],
    route: ROUTES.portfolio(lang),
    frontPicture: PORTFOLIO,
    stack: [
      ESkill.NextJS,
      ESkill.React,
      ESkill.TurboRepo,
      ESkill.TypeScript,
      ESkill.Tailwind,
      ESkill.ESLint,
      ESkill.Prettier,
      ESkill.ReactHookForm,
      ESkill.GSAP,
      ESkill.Sass,
      ESkill.ReactI18Next,
    ],
  },
  {
    id: 'solitaire',
    name: 'Solitaire',
    status: 'New',
    workType: [EWorkType.Game, EWorkType.VisualEffect],
    route: ROUTES.solitaire(lang),
    frontPicture: SOLITAIRE_FRONT,
    stack: [ESkill.HTML, ESkill.CSS, ESkill.JavaScript],
  },
  {
    id: 'snake',
    name: 'Snake',
    status: 'New',
    workType: [EWorkType.Game, EWorkType.VisualEffect],
    route: ROUTES.snake(lang),
    frontPicture: SNAKE_FRONT,
    backPicture: SNAKE_BACK,
    stack: [ESkill.HTML, ESkill.CSS, ESkill.JavaScript],
  },
  {
    id: 'miner',
    name: 'Miner',
    status: 'New',
    workType: [EWorkType.Game],
    route: ROUTES.miner(lang),
    frontPicture: FRONT_MINER,
    backPicture: BACK_MINER,
    stack: [ESkill.HTML, ESkill.CSS, ESkill.JavaScript],
  },
  {
    id: 'RPG',
    name: 'RPG Online Game',
    status: 'in process',
    workType: [EWorkType.Game, EWorkType.VisualEffect],
    route: ROUTES.rpg(lang),
    frontPicture: RPG,
    backPicture: RPG_GAME,
    stack: [
      ESkill.HTML,
      ESkill.CSS,
      ESkill.JavaScript,
      ESkill.Canvas,
      ESkill.Node,
      ESkill.Hapi,
      ESkill.Websockets,
      ESkill.Chat,
    ],
  },
  {
    id: 'ganttChart',
    name: 'Gantt Chart',
    status: 'New',
    workType: [EWorkType.Productivity],
    route: ROUTES.ganttChart(lang),
    frontPicture: GANTT_CHART_FRONT,
    backPicture: GANTT_CHART_BACK,
    stack: [
      ESkill.React,
      ESkill.TypeScript,
      ESkill.ReduxToolkit,
      ESkill.ReactDatepicker,
      ESkill.Sass,
      ESkill.ReactHookForm,
      ESkill.MaterialUI,
      ESkill.ESLint,
      ESkill.Prettier,
      ESkill.Yup,
    ],
  },
  {
    id: 'pokedex',
    name: 'Pokedex',
    workType: [EWorkType.Education],
    route: ROUTES.pokedex(lang),
    frontPicture: POKEDEX_HOME,
    backPicture: POKEDEX_DESKTOP,
    stack: [
      ESkill.NextJS,
      ESkill.React,
      ESkill.Prisma,
      ESkill.Mantine,
      ESkill.TypeScript,
      ESkill.ESLint,
      ESkill.Prettier,
      ESkill.Sass,
    ],
  },
  {
    id: 'english-learn',
    name: 'English learn',
    workType: [EWorkType.Education],
    route: ROUTES.english(lang),
    frontPicture: ENGLISH,
    stack: [
      ESkill.NextJS,
      ESkill.React,
      ESkill.NextAuth,
      ESkill.Prisma,
      ESkill.TypeScript,
      ESkill.Tailwind,
      ESkill.GoogleOneTap,
      ESkill.ESLint,
      ESkill.Prettier,
    ],
  },
  {
    id: 'thanos-effect',
    name: 'Thanos Effect',
    workType: [EWorkType.VisualEffect],
    route: ROUTES.thanos(lang),
    frontPicture: THANOS,
    backPicture: THANOS_BACK,
    stack: [ESkill.HTML, ESkill.CSS, ESkill.JavaScript, ESkill.Canvas],
  },
];

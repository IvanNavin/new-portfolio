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
import THANOS from '@assets/img/thanos.jpg';
import THANOS_BACK from '@assets/img/thanos-back.jpeg';
import { Locale } from '@root/i18n-config';

import { Work } from './types';

export const getWorks = (lang: Locale): Work[] => [
  {
    id: 'miner',
    name: 'Miner',
    status: 'New',
    route: ROUTES.miner(lang),
    frontPicture: FRONT_MINER,
    backPicture: BACK_MINER,
    stack: ['HTML', 'CSS', 'Javascript'],
  },
  {
    id: 'ganttChart',
    name: 'Gantt Chart',
    status: 'New',
    route: ROUTES.ganttChart(lang),
    frontPicture: GANTT_CHART_FRONT,
    backPicture: GANTT_CHART_BACK,
    stack: [
      'React',
      'TypeScript',
      'Redux Toolkit',
      'React Datepicker',
      'Sass',
      'React Hook Form',
      'MUI',
      'Es-lint',
      'Prettier',
    ],
  },
  {
    id: 'RPG',
    name: 'RPG Online Game',
    status: 'in process',
    route: ROUTES.rpg(lang),
    frontPicture: RPG,
    backPicture: RPG_GAME,
    stack: [
      'HTML',
      'CSS',
      'JS',
      'Canvas',
      'Animations',
      'Node',
      'Hapi',
      'Websockets',
      'Chat',
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    status: 'in process',
    route: ROUTES.portfolio(lang),
    frontPicture: PORTFOLIO,
    stack: [
      'HTML',
      'PUG',
      'SCSS',
      'JS',
      'Canvas',
      'Animations',
      'Webpack',
      'Es-Lint',
      'Prettier',
    ],
  },
  {
    id: 'pokedex',
    name: 'Pokedex',
    status: 'in process',
    route: ROUTES.pokedex(lang),
    frontPicture: POKEDEX_HOME,
    backPicture: POKEDEX_DESKTOP,
    stack: ['React', 'Redux', 'SSR', 'Scss', 'HookRouter', 'TS', 'Es-Lint'],
  },
  {
    id: 'thanos-effect',
    name: 'Thanos Effect',
    route: ROUTES.thanos(lang),
    frontPicture: THANOS,
    backPicture: THANOS_BACK,
    stack: ['HTML', 'CSS', 'JS', 'Canvas', 'Animations'],
  },
  {
    id: 'english-learn',
    name: 'English learn',
    route: ROUTES.english(lang),
    frontPicture: ENGLISH,
    stack: ['React', 'Redux', 'SCSS', 'Firebase'],
  },
];

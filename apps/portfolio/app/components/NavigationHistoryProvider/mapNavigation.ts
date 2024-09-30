import { ROUTES } from '@app/constants/routes';
import { RouteMapType } from '@components/NavigationHistoryProvider/types';

export const mapNavigation: RouteMapType = {
  [ROUTES.root()]: {
    goOut: 'left',
    goIn: 'right',
    level: 0,
    [ROUTES.about()]: {
      goOut: 'right',
      goIn: 'left',
      level: 1,
    },
    [ROUTES.contact()]: {
      goOut: 'right',
      goIn: 'left',
      level: 1,
    },
    [ROUTES.myWorks()]: {
      goOut: 'right',
      goIn: 'left',
      goNext: 'down',
      goBack: 'up',
      level: 1,
      [ROUTES.english()]: {
        goOut: 'up',
        goIn: 'down',
        level: 2,
      },
      [ROUTES.ganttChart()]: {
        goOut: 'up',
        goIn: 'down',
        level: 2,
      },
      [ROUTES.miner()]: {
        goOut: 'up',
        goIn: 'down',
        level: 2,
      },
      [ROUTES.pokedex()]: {
        goOut: 'up',
        goIn: 'down',
        level: 2,
      },
      [ROUTES.portfolio()]: {
        goOut: 'up',
        goIn: 'down',
        level: 2,
      },
      [ROUTES.rpg()]: {
        goOut: 'up',
        goIn: 'down',
        level: 2,
      },
      [ROUTES.thanos()]: {
        goOut: 'up',
        goIn: 'down',
        level: 2,
      },
    },
    [ROUTES.performances()]: {
      goOut: 'right',
      goIn: 'left',
      goNext: 'down',
      goBack: 'up',
      level: 1,
      [ROUTES.accessibility()]: {
        goOut: 'up',
        goIn: 'down',
        level: 2,
      },
      [ROUTES.regexp()]: {
        goOut: 'up',
        goIn: 'down',
        level: 2,
      },
    },
  },
};

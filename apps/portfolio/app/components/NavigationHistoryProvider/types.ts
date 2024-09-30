import { ROUTES } from '@app/constants/routes';
import { DirectionType } from '@components/AnimatedPage/types';

type NavigationDirection = 'forward' | 'backward';

export type HistoryEntry = {
  path: string;
  direction: NavigationDirection;
};

export type NavigationHistoryContextProps = {
  history: HistoryEntry[];
  direction: NavigationDirection;
};

export type RouteMapType = {
  goOut?: DirectionType;
  goIn?: DirectionType;
  goNext?: DirectionType;
  goBack?: DirectionType;
  level?: number;
  [key: string]: DirectionType | RouteMapType | undefined | number;
};

export type KeyOfRoutesType = keyof typeof ROUTES;

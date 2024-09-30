import { ReactNode } from 'react';

export type DirectionType = 'left' | 'right' | 'up' | 'down';

export type AnimatedPageProps = {
  children: ReactNode;
  direction: DirectionType; // animation direction
  duration?: number; // animation duration
};

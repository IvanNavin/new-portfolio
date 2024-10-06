import { AnimationControls } from 'framer-motion';
import { createContext } from 'react';

export const AnimateContext = createContext<AnimationControls | undefined>(
  undefined,
);

import { LegacyAnimationControls } from 'framer-motion';
import { createContext } from 'react';

export const AnimateContext = createContext<
  LegacyAnimationControls | undefined
>(undefined);

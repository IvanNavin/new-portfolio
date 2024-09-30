import { useViewportSize } from '@mantine/hooks';
import { motion } from 'framer-motion';

import { getAnimation } from './getAnimation';
import { AnimatedPageProps } from './types';

export const AnimatedPage = ({
  children,
  direction,
  duration = 0.5,
}: AnimatedPageProps) => {
  const { height, width } = useViewportSize();
  const { initial, exit } = getAnimation(direction, width, height);

  return (
    <motion.div
      key={JSON.stringify(children)}
      initial={initial}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={exit}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  );
};

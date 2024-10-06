'use client';
import { AnimateContext } from '@components/AnimateProvider/context';
import { motion as m, useAnimationControls } from 'framer-motion';
import { ReactNode, useEffect } from 'react';

type Props = {
  children: ReactNode;
};

export const AnimateProvider = ({ children }: Props) => {
  const controls = useAnimationControls();

  useEffect(() => {
    setTimeout(() => {
      void controls?.start({
        opacity: 1,
        transition: { duration: 0.5 },
      });
    }, 50);
  }, []);

  return (
    <AnimateContext.Provider value={controls}>
      <m.main
        initial={{ opacity: 0 }}
        animate={controls}
        transition={{ duration: 0.5 }}
      >
        {children}
      </m.main>
    </AnimateContext.Provider>
  );
};

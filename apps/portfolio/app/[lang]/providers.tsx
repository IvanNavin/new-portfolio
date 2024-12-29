'use client';
import { AnimateProvider } from '@components/AnimateProvider';
import { Preloader } from '@components/preloader';
import { MantineProvider } from '@mantine/core';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

import '@mantine/core/styles.css';

type Props = {
  children: ReactNode;
};
export const Providers = ({ children }: Props) => {
  const pathName = usePathname();

  return (
    <Suspense fallback={<Preloader />}>
      <MantineProvider withGlobalClasses withCssVariables withStaticClasses>
        <AnimatePresence initial={false} mode='wait'>
          <AnimateProvider key={pathName}>{children}</AnimateProvider>
        </AnimatePresence>
      </MantineProvider>
    </Suspense>
  );
};

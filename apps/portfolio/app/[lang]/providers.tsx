'use client';
import { AnimateProvider } from '@components/AnimateProvider';
import { Preloader } from '@components/preloader';
import { VisitTracker } from '@components/VisitTracker';
import { LangContext } from '@i18n/context';
import { MantineProvider } from '@mantine/core';
import { Locale } from '@root/i18n-config';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

import '@mantine/core/styles.css';

type Props = {
  children: ReactNode;
  lang: Locale;
};
export const Providers = ({ children, lang }: Props) => {
  const pathName = usePathname();

  return (
    <LangContext.Provider value={lang}>
      <Suspense fallback={<Preloader />}>
        <MantineProvider withGlobalClasses withCssVariables withStaticClasses>
          <AnimatePresence initial={false} mode='wait'>
            <AnimateProvider key={pathName}>{children}</AnimateProvider>
            <VisitTracker />
          </AnimatePresence>
        </MantineProvider>
      </Suspense>
    </LangContext.Provider>
  );
};

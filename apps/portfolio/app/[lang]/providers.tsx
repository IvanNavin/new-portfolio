'use client';
import { AnimateProvider } from '@components/AnimateProvider';
import { Preloader } from '@components/preloader';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

type Props = {
  children: ReactNode;
};
export const Providers = ({ children }: Props) => {
  const pathName = usePathname();

  return (
    <Suspense fallback={<Preloader />}>
      <AnimatePresence initial={false} mode='wait'>
        <AnimateProvider key={pathName}>{children}</AnimateProvider>
      </AnimatePresence>
    </Suspense>
  );
};

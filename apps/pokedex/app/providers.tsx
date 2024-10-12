'use client';
import { MantineProvider } from '@mantine/core';
import { ReactNode, Suspense } from 'react';

type Props = {
  children: ReactNode;
};

export const Providers = ({ children }: Props) => {
  return (
    <MantineProvider withGlobalClasses withCssVariables withStaticClasses>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </MantineProvider>
  );
};

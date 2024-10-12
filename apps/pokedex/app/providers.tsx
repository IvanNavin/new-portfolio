'use client';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { ReactNode, Suspense } from 'react';

type Props = {
  children: ReactNode;
};

export const Providers = ({ children }: Props) => {
  return (
    <MantineProvider withGlobalClasses withCssVariables withStaticClasses>
      <ModalsProvider>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </ModalsProvider>
    </MantineProvider>
  );
};

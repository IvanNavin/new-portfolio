'use client';
import { MantineProvider } from '@mantine/core';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

import '@mantine/core/styles.css';

type Props = {
  children: ReactNode;
};

export const Providers = ({ children }: Props) => {
  return (
    <SessionProvider>
      <MantineProvider>{children}</MantineProvider>
    </SessionProvider>
  );
};

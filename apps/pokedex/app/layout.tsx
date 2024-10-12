import { Providers } from '@app/providers';
import { ColorSchemeScript } from '@mantine/core';
import { karla } from '@src/constants';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'Pokédex',
};

type RootProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootProps) {
  return (
    <html lang='en'>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={karla.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

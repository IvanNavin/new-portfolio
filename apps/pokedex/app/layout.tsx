import { Providers } from '@app/providers';
import { ColorSchemeScript } from '@mantine/core';
import { karla } from '@src/constants';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'Pokédex',
  description:
    'Browse 800+ Pokémon — search by name, filter by type, experience and attack, and explore each one’s stats and abilities.',
  openGraph: {
    title: 'Pokédex',
    description:
      'Browse 800+ Pokémon — search by name, filter by type, experience and attack, and explore each one’s stats and abilities.',
    type: 'website',
  },
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
      <body className={karla.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Pokédex',
};

type RootProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootProps) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}

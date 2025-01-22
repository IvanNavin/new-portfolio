import { mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { Big_Shoulders_Stencil_Display } from 'next/font/google';
import { ReactNode } from 'react';

const font = Big_Shoulders_Stencil_Display({
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
});

import './globals.css';

export const metadata: Metadata = {
  title: 'RPG Game',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang='en' {...mantineHtmlProps}>
      <body className={font.className}>{children}</body>
    </html>
  );
}

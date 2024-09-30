import { russoOne } from '@assets/fonts';
import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { Locale } from '@root/i18n-config';
import { dir } from 'i18next';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import './globals.css';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Holovko Ivan Portfolio',
  description: 'Frontend developer portfolio',
};

type RootLayoutType = {
  children: ReactNode;
  params: { lang: Locale };
};

export default function RootLayout({
  children,
  params: { lang },
}: RootLayoutType) {
  return (
    <html lang={lang} dir={dir(lang)}>
      <body className={`${russoOne.className} bg-black text-white antialiased`}>
        <Providers>
          {children}
          <LanguageSwitcher lang={lang} />
        </Providers>
      </body>
    </html>
  );
}

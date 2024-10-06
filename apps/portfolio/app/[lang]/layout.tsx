import { russoOne } from '@assets/fonts';
import STARS from '@assets/img/stars.png';
import TWINKLING from '@assets/img/twinkling.png';
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
      <body
        className={`${russoOne.className} relative bg-black text-white antialiased`}
        style={{ background: `#000 url(${STARS.src}) repeat top center` }}
      >
        <div
          className='absolute inset-0 z-[-1] animate-move-twink-back'
          style={{
            background: `transparent url(${TWINKLING.src}) repeat top center`,
          }}
        />
        <Providers>
          {children}
          <LanguageSwitcher lang={lang} />
        </Providers>
      </body>
    </html>
  );
}

import { russoOne } from '@assets/fonts';
import APPLE_TOUCH_ICON from '@assets/img/favicons/apple-touch-icon.png';
import FAVICON from '@assets/img/favicons/favicon.ico';
import FAVICON16 from '@assets/img/favicons/favicon-16x16.png';
import FAVICON32 from '@assets/img/favicons/favicon-32x32.png';
import STARS from '@assets/img/stars.png';
import TWINKLING from '@assets/img/twinkling.png';
import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { mantineHtmlProps } from '@mantine/core';
import { Locale } from '@root/i18n-config';
import { dir } from 'i18next';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import './globals.css';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Holovko Ivan Portfolio',
  description: 'Frontend developer portfolio',
  icons: {
    icon: FAVICON.src,
    shortcut: FAVICON.src,
    apple: APPLE_TOUCH_ICON.src,
    other: [
      {
        rel: 'icon',
        url: FAVICON32.src,
        sizes: '32x32',
      },
      {
        rel: 'icon',
        url: FAVICON16.src,
        sizes: '16x16',
      },
    ],
  },
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
    <html lang={lang} dir={dir(lang)} {...mantineHtmlProps}>
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
        <Providers lang={lang}>
          {children}
          <LanguageSwitcher lang={lang} />
        </Providers>
      </body>
    </html>
  );
}

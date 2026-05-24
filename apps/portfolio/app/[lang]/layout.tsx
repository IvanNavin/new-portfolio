import { russoOne } from '@assets/fonts';
import APPLE_TOUCH_ICON from '@assets/img/favicons/apple-touch-icon.png';
import FAVICON from '@assets/img/favicons/favicon.ico';
import FAVICON16 from '@assets/img/favicons/favicon-16x16.png';
import FAVICON32 from '@assets/img/favicons/favicon-32x32.png';
import STARS from '@assets/img/stars.png';
import TWINKLING from '@assets/img/twinkling.png';
import { CommandPalette } from '@components/CommandPalette';
import { LanguageSwitcher } from '@components/LanguageSwitcher';
import { PWARegister } from '@components/PWARegister';
import { Locale } from '@root/i18n-config';
import { dir } from 'i18next';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import './globals.css';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Holovko Ivan Portfolio',
  description: 'Frontend developer portfolio',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Ivan Holovko',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: FAVICON.src,
    shortcut: FAVICON.src,
    apple: '/icons/apple-touch-icon.png',
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

export const viewport = {
  themeColor: '#020617',
};

type RootLayoutType = {
  children: ReactNode;
  params: Promise<{ lang: Locale }>;
};

export default async function RootLayout({ children, params }: RootLayoutType) {
  const { lang } = await params;
  return (
    <html lang={lang} dir={dir(lang)}>
      <body
        suppressHydrationWarning
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
          <CommandPalette lang={lang} />
          <PWARegister />
        </Providers>
      </body>
    </html>
  );
}

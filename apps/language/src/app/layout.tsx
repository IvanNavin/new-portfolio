import { roboto } from '@app/fonts/roboto';
import { Providers } from '@app/providers';
import APPLE_TOUCH_ICON from '@src/assets/favicons/apple-touch-icon.png';
import FAVICON from '@src/assets/favicons/favicon.ico';
import FAVICON16 from '@src/assets/favicons/favicon-16x16.png';
import FAVICON32 from '@src/assets/favicons/favicon-32x32.png';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'Language',
  description: 'Language',
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

type Props = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: Props) {
  return (
    <html lang='en'>
      <body className={roboto.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

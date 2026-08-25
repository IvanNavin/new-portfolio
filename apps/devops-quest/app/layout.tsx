import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

import { Hud } from '@/components/hud/Hud';
import { Toaster } from '@/components/Toaster';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DevOps Quest — вчись DevOps практикою',
  description:
    'Гра, у якій ти проходиш шлях від першого ls до деплою в Kubernetes: справжній термінал, місії, рівні та підказки.',
};

export const viewport: Viewport = {
  themeColor: '#05070a',
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="uk" className={`${inter.variable} ${mono.variable}`}>
    <body className="min-h-dvh">
      <Hud />
      <main className="mx-auto flex min-h-[calc(100dvh-49px)] max-w-6xl flex-col px-4 py-5">
        {children}
      </main>
      <Toaster />
    </body>
  </html>
);

export default RootLayout;

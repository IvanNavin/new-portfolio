import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

import { Hud } from '@/components/hud/Hud';
import { OneTap } from '@/components/OneTap';
import { ProgressSync } from '@/components/ProgressSync';
import { SessionProviderClient } from '@/components/SessionProviderClient';
import { Toaster } from '@/components/Toaster';
import { SIGN_IN_ENABLED } from '@/lib/auth-enabled';

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
    {/* A fixed-height shell on desktop so panes scroll independently instead
        of the whole page growing; below lg it falls back to normal flow. */}
    <body className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      {SIGN_IN_ENABLED ? (
        <SessionProviderClient>
          <Hud />
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 lg:min-h-0">
            {children}
          </main>
          <OneTap />
          <ProgressSync />
        </SessionProviderClient>
      ) : (
        <>
          <Hud />
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-5 lg:min-h-0">
            {children}
          </main>
        </>
      )}
      <Toaster />
    </body>
  </html>
);

export default RootLayout;

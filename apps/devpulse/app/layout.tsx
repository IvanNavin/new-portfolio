import "./globals.css";

import { AuthedStateSync } from "@components/AuthedStateSync";
import { OneTap } from "@components/OneTap";
import { PWARegister } from "@components/PWARegister";
import { ReadOnClick } from "@components/ReadOnClick";
import { SessionProviderClient } from "@components/SessionProviderClient";
import { ShortcutsOverlay } from "@components/ShortcutsOverlay";
import { ThemeScript } from "@components/ThemeScript";
import { Toaster } from "@components/Toaster";
import { TooltipProvider } from "@components/TooltipProvider";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "devpulse — frontend stack news",
  description:
    "Releases, browser updates, and notes from the libraries I actually use.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "devpulse",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport = {
  themeColor: "#07090d",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      {/* data-gramm / data-gramm_editor / data-enable-grammarly disable
          Grammarly globally on the page. Grammarly otherwise injects
          attributes on body AND every input/textarea after SSR, which
          React 19 raises as hydration error #418. suppressHydrationWarning
          covers body itself; disabling the extension covers descendants
          (which suppressHydrationWarning can't reach, it's one-level only).
          Hydration failure also wipes <html data-theme="light"> that
          ThemeScript set inline, which is why "light selected but page
          dark" kept happening — fix #418 and the theme switch sticks. */}
      <body
        suppressHydrationWarning
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
      >
        <SessionProviderClient>
          <TooltipProvider>
            <PWARegister />
            <OneTap />
            <AuthedStateSync />
            <ReadOnClick />
            {children}
            <Toaster />
            <ShortcutsOverlay />
          </TooltipProvider>
        </SessionProviderClient>
      </body>
    </html>
  );
}

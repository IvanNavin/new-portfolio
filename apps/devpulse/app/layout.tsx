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
      <body>
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

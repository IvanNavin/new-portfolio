import "./globals.css";

import type { Metadata } from "next";
import { ReactNode } from "react";

import { AuthedStateSync } from "@components/AuthedStateSync";
import { OneTap } from "@components/OneTap";
import { PWARegister } from "@components/PWARegister";
import { SessionProviderClient } from "@components/SessionProviderClient";

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
    <html lang="en">
      <body>
        <SessionProviderClient>
          <PWARegister />
          <OneTap />
          <AuthedStateSync />
          {children}
        </SessionProviderClient>
      </body>
    </html>
  );
}

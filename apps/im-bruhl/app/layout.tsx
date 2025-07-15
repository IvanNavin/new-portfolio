import { VisitTracker } from "@app/components/VisitTracker";
import { MantineProvider } from "@mantine/core";
import { roboto } from "language/src/app/fonts/roboto";
import type { Metadata } from "next";
import { ReactNode } from "react";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Im Brühl 48",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="de">
      <body className="text-black" style={roboto.style}>
        <MantineProvider
          defaultColorScheme="light"
          forceColorScheme="light"
          withCssVariables
          withGlobalClasses
          withStaticClasses
        >
          {children}
          <VisitTracker />
        </MantineProvider>
      </body>
    </html>
  );
}

"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Tiny wrapper so the server layout can stay an async server component
 * while still putting next-auth's SessionProvider context around children.
 */
export function SessionProviderClient({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

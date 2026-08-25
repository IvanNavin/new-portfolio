'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

/** Thin client shim so the server layout can still be a server component. */
export const SessionProviderClient = ({
  children,
}: {
  children: ReactNode;
}) => <SessionProvider>{children}</SessionProvider>;

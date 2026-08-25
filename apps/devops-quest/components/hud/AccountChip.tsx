'use client';

import { LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

/**
 * Only appears once someone is actually signed in. There is deliberately no
 * "Sign in" button: One Tap offers itself, and the game never gates on it.
 */
export const AccountChip = () => {
  const { data: session, status } = useSession();
  if (status !== 'authenticated' || !session.user) return null;

  const label = session.user.name ?? session.user.email;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="hidden max-w-28 truncate text-[11.5px] text-ink-dim sm:inline"
        title={session.user.email}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={() => void signOut({ redirect: false })}
        title="Вийти (прогрес залишиться в цьому браузері)"
        aria-label="Вийти"
        className="text-ink-faint transition-colors hover:text-ink-dim"
      >
        <LogOut size={13} />
      </button>
    </div>
  );
};

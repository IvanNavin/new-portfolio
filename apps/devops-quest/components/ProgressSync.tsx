'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

import { SIGN_IN_ENABLED } from '@/lib/auth-enabled';
import { readProgress, writeProgress } from '@/lib/progress/storage';
import { mergeProgress, type Progress } from '@/lib/progress/types';
import { toast } from '@/lib/toasts';

/**
 * Mirrors progress between localStorage and the database for signed-in
 * players. localStorage stays the source of truth: on sign-in we pull the
 * server copy, merge (better run wins per mission), write the result back
 * locally and push it up. Same shape as devpulse's AuthedStateSync.
 */
export const ProgressSync = () => (SIGN_IN_ENABLED ? <SyncOnSignIn /> : null);

const SyncOnSignIn = () => {
  const { status } = useSession();
  const synced = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || synced.current) return;
    synced.current = true;

    const run = async () => {
      try {
        const response = await fetch('/api/progress', { cache: 'no-store' });
        if (!response.ok) return;

        const body: unknown = await response.json();
        const remote =
          typeof body === 'object' && body !== null && 'progress' in body
            ? ((body as { progress: Progress }).progress ?? null)
            : null;
        if (!remote?.missions) return;

        const local = readProgress();
        const merged = mergeProgress(local, remote);
        writeProgress(merged);

        await fetch('/api/progress', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(merged),
        });

        const gained =
          Object.keys(merged.missions).length -
          Object.keys(local.missions).length;
        if (gained > 0) {
          toast(
            'info',
            'Прогрес синхронізовано',
            `Підтягнуто місій: ${gained}`,
          );
        }
      } catch {
        // Sync is best-effort; the game never depends on it.
      }
    };

    void run();
  }, [status]);

  return null;
};

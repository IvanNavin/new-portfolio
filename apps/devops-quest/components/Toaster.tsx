'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';
import { subscribeToasts, type Toast } from '@/lib/toasts';

const TONE: Record<Toast['tone'], string> = {
  xp: 'border-xp/40 bg-xp-soft text-xp',
  rank: 'border-accent/40 bg-accent-soft text-accent',
  info: 'border-info/40 bg-info-soft text-info',
  danger: 'border-danger/40 bg-danger-soft text-danger',
};

export const Toaster = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(
    () =>
      subscribeToasts((incoming) => {
        setToasts((current) => [...current, incoming]);
        window.setTimeout(() => {
          setToasts((current) =>
            current.filter((each) => each.id !== incoming.id),
          );
        }, 3600);
      }),
    [],
  );

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
      {toasts.map((each) => (
        <div
          key={each.id}
          className={cn(
            'toast-in rounded-xl border px-3.5 py-2.5 shadow-lg backdrop-blur',
            TONE[each.tone],
          )}
        >
          <p className="font-mono text-[13px] font-semibold">{each.title}</p>
          {each.detail ? (
            <p className="mt-0.5 max-w-56 text-[11.5px] text-ink-dim">
              {each.detail}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
};

import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type Tone = 'accent' | 'info' | 'warn' | 'danger' | 'xp' | 'neutral';

const TONES: Record<Tone, string> = {
  accent: 'bg-accent-soft text-accent',
  info: 'bg-info-soft text-info',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
  xp: 'bg-xp-soft text-xp',
  neutral: 'bg-surface-sunken text-ink-dim',
};

type BadgeProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

export const Badge = ({
  tone = 'neutral',
  children,
  className,
}: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide',
      TONES[tone],
      className,
    )}
  >
    {children}
  </span>
);

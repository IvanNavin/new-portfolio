import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { MENTOR } from '@/lib/content/mentor';

import { MentorAvatar } from './MentorAvatar';

type MentorSaysProps = {
  children: ReactNode;
  /** `intro` is the roomier variant used on the world map. */
  variant?: 'default' | 'intro';
  showRole?: boolean;
  className?: string;
};

export const MentorSays = ({
  children,
  variant = 'default',
  showRole = false,
  className,
}: MentorSaysProps) => (
  <div className={cn('flex items-start gap-3', className)}>
    <MentorAvatar size={variant === 'intro' ? 52 : 36} />

    {/* The little notch makes it read as speech rather than as a callout box. */}
    <div className="relative min-w-0 flex-1 rounded-xl border border-edge bg-surface-raised px-3.5 py-2.5">
      <span
        aria-hidden
        className="absolute -left-[6px] top-4 size-[10px] rotate-45 border-b border-l border-edge bg-surface-raised"
      />
      <p className="text-[11px] font-medium uppercase tracking-wider text-accent">
        {MENTOR.name}
        {showRole ? (
          <span className="ml-2 normal-case tracking-normal text-ink-faint">
            {MENTOR.role}
          </span>
        ) : null}
      </p>
      <div
        className={cn(
          'mt-1 space-y-2 leading-relaxed text-ink-dim',
          variant === 'intro' ? 'text-[13.5px]' : 'text-[13px]',
        )}
      >
        {children}
      </div>
    </div>
  </div>
);

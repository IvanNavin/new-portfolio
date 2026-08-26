'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { HERO, MENTOR } from '@/lib/content/story';

import { HeroAvatar } from './HeroAvatar';
import { MentorAvatar } from './MentorAvatar';

type CharacterSaysProps = {
  who: 'hero' | 'mentor';
  children: ReactNode;
  showRole?: boolean;
  size?: number;
  className?: string;
};

/** A speech bubble for one of the two characters. */
export const CharacterSays = ({
  who,
  children,
  showRole = false,
  size = 36,
  className,
}: CharacterSaysProps) => {
  const person = who === 'hero' ? HERO : MENTOR;
  const Avatar = who === 'hero' ? HeroAvatar : MentorAvatar;

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <Avatar size={size} />

      {/* The notch makes it read as speech rather than as a callout box. */}
      <div className="relative min-w-0 flex-1 rounded-xl border border-edge bg-surface-raised px-3.5 py-2.5">
        <span
          aria-hidden
          className="absolute -left-[6px] top-4 size-[10px] rotate-45 border-b border-l border-edge bg-surface-raised"
        />
        <p
          className={cn(
            'text-[11px] font-medium uppercase tracking-wider',
            who === 'hero' ? 'text-accent' : 'text-xp',
          )}
        >
          {person.name}
          {showRole ? (
            <span className="ml-2 normal-case tracking-normal text-ink-faint">
              {person.role}
            </span>
          ) : null}
        </p>
        <div className="mt-1 space-y-2 text-[13px] leading-relaxed text-ink-dim">
          {children}
        </div>
      </div>
    </div>
  );
};

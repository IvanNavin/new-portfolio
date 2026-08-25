'use client';

import { Terminal as TerminalIcon } from 'lucide-react';
import Link from 'next/link';

import { MAX_STARS, TOTAL_XP } from '@/lib/content/registry';
import { nextRank, rankFor, rankProgress } from '@/lib/progress/rank';
import { useProgress } from '@/lib/progress/useProgress';

import { ProgressBar } from '../ui/ProgressBar';
import { AccountChip } from './AccountChip';

export const Hud = () => {
  const { xp, stars } = useProgress();
  const rank = rankFor(xp);
  const upcoming = nextRank(xp);

  return (
    <header className="sticky top-0 z-30 border-b border-edge bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <TerminalIcon size={17} className="text-accent" />
          <span className="font-mono text-[13px] font-semibold tracking-tight text-ink">
            devops<span className="text-accent">/</span>quest
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="truncate text-[11.5px] font-medium text-ink">
                {rank.title}
                {upcoming ? (
                  <span className="ml-1.5 text-ink-faint">
                    → {upcoming.title}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-xp">
                {xp} / {TOTAL_XP} XP
              </span>
            </div>
            <ProgressBar value={rankProgress(xp)} tone="xp" />
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0">
          <span className="flex items-center gap-1 font-mono text-[12px]">
            <span className="text-warn">★</span>
            <span className="text-ink">{stars}</span>
            <span className="text-ink-faint">/ {MAX_STARS}</span>
          </span>
          <AccountChip />
        </div>
      </div>
    </header>
  );
};

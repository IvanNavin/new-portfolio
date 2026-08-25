'use client';

import { Check, Lock } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { ACTS, LEVELS } from '@/lib/content/registry';
import type { Level } from '@/lib/content/types';
import { useProgress } from '@/lib/progress/useProgress';

import { ProgressBar } from '../ui/ProgressBar';

const LevelCard = ({ level, index }: { level: Level; index: number }) => {
  const { isLevelUnlocked, levelStats } = useProgress();
  const unlocked = isLevelUnlocked(level.id);
  const stats = levelStats(level);
  const complete = stats.done === stats.total;

  const body = (
    <div
      className={cn(
        'group relative flex gap-4 rounded-xl border px-4 py-3.5 transition-colors',
        unlocked
          ? 'border-edge bg-surface-raised hover:border-accent/45'
          : 'border-edge/60 bg-surface-raised/40',
      )}
    >
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-lg border font-mono text-[15px] font-semibold',
          complete
            ? 'border-accent/50 bg-accent-soft text-accent'
            : unlocked
              ? 'border-edge-strong bg-surface-sunken text-ink'
              : 'border-edge bg-surface-sunken text-ink-faint',
        )}
      >
        {complete ? (
          <Check size={18} />
        ) : unlocked ? (
          String(index + 1).padStart(2, '0')
        ) : (
          <Lock size={15} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className={cn(
              'truncate text-[14.5px] font-medium',
              unlocked ? 'text-ink' : 'text-ink-faint',
            )}
          >
            {level.title}
          </h3>
          {unlocked ? (
            <span className="shrink-0 font-mono text-[11px] text-ink-faint">
              {stats.done}/{stats.total}
            </span>
          ) : null}
        </div>

        <p
          className={cn(
            'mt-0.5 line-clamp-1 text-[12.5px]',
            unlocked ? 'text-ink-dim' : 'text-ink-faint',
          )}
        >
          {unlocked ? level.subtitle : 'Заблоковано — пройди попередній рівень'}
        </p>

        {unlocked ? (
          <div className="mt-2.5 flex items-center gap-3">
            <ProgressBar
              value={stats.total === 0 ? 0 : stats.done / stats.total}
              className="flex-1"
            />
            {/* Earned out of the level's maximum — an averaged 1..3 rating would
                read as "you scored one star" on a level you have barely started. */}
            <span className="shrink-0 font-mono text-[11px] text-ink-faint">
              <span className="text-warn">★</span> {stats.stars}/
              {stats.total * 3}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );

  return unlocked ? (
    <Link href={`/level/${level.id}`} className="block">
      {body}
    </Link>
  ) : (
    <div aria-disabled className="cursor-not-allowed">
      {body}
    </div>
  );
};

export const WorldMap = () => (
  <div className="space-y-9">
    {ACTS.map((act) => {
      const levels = LEVELS.filter((level) => level.act === act.id);
      if (levels.length === 0) return null;
      return (
        <section key={act.id}>
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-accent">
              {act.title}
            </h2>
            <span className="text-[12px] text-ink-faint">{act.subtitle}</span>
          </div>
          <div className="space-y-2.5">
            {levels.map((level) => (
              <LevelCard
                key={level.id}
                level={level}
                index={LEVELS.indexOf(level)}
              />
            ))}
          </div>
        </section>
      );
    })}
  </div>
);

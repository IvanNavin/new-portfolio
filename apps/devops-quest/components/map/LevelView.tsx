'use client';

import { ArrowLeft, Check, Lock, Play } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/cn';
import { getLevel } from '@/lib/content/registry';
import { levelSceneFor } from '@/lib/content/story';
import { useProgress } from '@/lib/progress/useProgress';

import { Narrator } from '../story/Narrator';
import { Badge } from '../ui/Badge';
import { Stars } from '../ui/Stars';

type LevelViewProps = {
  levelId: string;
};

export const LevelView = ({ levelId }: LevelViewProps) => {
  const level = getLevel(levelId);
  const { isMissionUnlocked, recordOf, levelStats } = useProgress();
  if (!level) throw new Error(`Unknown level: ${levelId}`);
  const stats = levelStats(level);

  return (
    <div className="scroll-thin space-y-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink-dim"
        >
          <ArrowLeft size={13} />
          Карта світу
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-ink sm:text-2xl">
          {level.title}
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-dim">{level.subtitle}</p>
      </div>

      {levelSceneFor(level.id) ? (
        <Narrator lines={[levelSceneFor(level.id) as string]} />
      ) : null}

      <div className="rounded-xl border border-edge bg-surface-raised px-4 py-3.5">
        <p className="text-[13.5px] leading-relaxed text-ink-dim">
          {level.brief}
        </p>
        <div className="mt-3 flex items-center gap-4 font-mono text-[11.5px] text-ink-faint">
          <span>
            <span className="text-ink">{stats.done}</span>/{stats.total} місій
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-warn">★</span>
            <span className="text-ink">{stats.stars}</span>/{stats.total * 3}
          </span>
        </div>
      </div>

      <ol className="space-y-2.5">
        {level.missions.map((mission, index) => {
          const unlocked = isMissionUnlocked(mission.id);
          const record = recordOf(mission.id);

          const inner = (
            <div
              className={cn(
                'flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-colors',
                unlocked
                  ? 'border-edge bg-surface-raised hover:border-accent/45'
                  : 'border-edge/60 bg-surface-raised/40',
              )}
            >
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-lg border font-mono text-[13px]',
                  record
                    ? 'border-accent/50 bg-accent-soft text-accent'
                    : unlocked
                      ? 'border-edge-strong bg-surface-sunken text-ink'
                      : 'border-edge bg-surface-sunken text-ink-faint',
                )}
              >
                {record ? (
                  <Check size={16} />
                ) : unlocked ? (
                  index + 1
                ) : (
                  <Lock size={13} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  className={cn(
                    'truncate text-[14px] font-medium',
                    unlocked ? 'text-ink' : 'text-ink-faint',
                  )}
                >
                  {mission.title}
                </h3>
                <p
                  className={cn(
                    'mt-0.5 line-clamp-1 text-[12.5px]',
                    unlocked ? 'text-ink-dim' : 'text-ink-faint',
                  )}
                >
                  {unlocked
                    ? mission.goal
                    : 'Відкриється після попередньої місії'}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {record ? <Stars value={record.stars} /> : null}
                <Badge tone={record ? 'accent' : 'xp'}>
                  {record ? `${record.xp} XP` : `${mission.xp} XP`}
                </Badge>
                {unlocked && !record ? (
                  <Play size={14} className="text-accent" />
                ) : null}
              </div>
            </div>
          );

          return (
            <li key={mission.id}>
              {unlocked ? (
                <Link href={`/mission/${mission.id}`} className="block">
                  {inner}
                </Link>
              ) : (
                <div aria-disabled className="cursor-not-allowed">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

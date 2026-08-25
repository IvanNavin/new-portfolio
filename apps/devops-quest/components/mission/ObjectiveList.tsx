'use client';

import { Check, Circle } from 'lucide-react';

import { cn } from '@/lib/cn';

export type ObjectiveStatus = {
  id: string;
  label: string;
  hintOnFail?: string;
  done: boolean;
};

type ObjectiveListProps = {
  objectives: ObjectiveStatus[];
  /** Nudges only appear once the player has actually tried and stumbled. */
  showNudges: boolean;
};

export const ObjectiveList = ({
  objectives,
  showNudges,
}: ObjectiveListProps) => {
  const done = objectives.filter((objective) => objective.done).length;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
          Цілі місії
        </h3>
        <span className="font-mono text-[11px] text-ink-dim">
          {done}/{objectives.length}
        </span>
      </div>

      <ul className="space-y-1.5">
        {objectives.map((objective) => (
          <li
            key={objective.id}
            className={cn(
              'rounded-lg border px-2.5 py-2 transition-colors',
              objective.done
                ? 'goal-pop border-accent/35 bg-accent-soft'
                : 'border-edge bg-surface-raised',
            )}
          >
            <div className="flex items-start gap-2">
              {objective.done ? (
                <Check size={14} className="mt-0.5 shrink-0 text-accent" />
              ) : (
                <Circle size={14} className="mt-0.5 shrink-0 text-ink-faint" />
              )}
              <span
                className={cn(
                  'text-[13px] leading-snug',
                  objective.done ? 'text-accent' : 'text-ink-dim',
                )}
              >
                {objective.label}
              </span>
            </div>

            {showNudges && !objective.done && objective.hintOnFail ? (
              <p className="mt-1.5 pl-6 text-[12px] leading-snug text-warn/80">
                {objective.hintOnFail}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};

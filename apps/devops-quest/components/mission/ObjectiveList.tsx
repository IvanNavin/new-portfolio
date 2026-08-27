'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/cn';

export type ObjectiveStatus = {
  id: string;
  label: string;
  hintOnFail?: string;
  /** A specific correction for a wrong attempt; shown as soon as it exists. */
  feedback?: string | null;
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
        <h3 className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-accent">
          Твоє завдання
        </h3>
        <span className="font-mono text-[11px] text-ink-dim">
          {done}/{objectives.length}
        </span>
      </div>

      <ol className="space-y-1.5">
        {objectives.map((objective, index) => (
          <li
            key={objective.id}
            className={cn(
              'rounded-lg border px-2.5 py-2 transition-colors',
              objective.done
                ? 'goal-pop border-accent/35 bg-accent-soft'
                : 'border-edge bg-surface-raised',
            )}
          >
            <div className="flex items-start gap-2.5">
              {/* The step number is the checkbox: it becomes a tick when done,
                  so the task list and the progress list are the same list. */}
              <span
                className={cn(
                  'mt-px flex size-5 shrink-0 items-center justify-center rounded-md font-mono text-[11px]',
                  objective.done
                    ? 'bg-accent text-surface'
                    : 'bg-surface-sunken text-ink-faint',
                )}
              >
                {objective.done ? (
                  <Check size={13} strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  'text-[13px] leading-snug',
                  objective.done ? 'text-accent' : 'text-ink-dim',
                )}
              >
                {objective.label}
              </span>
            </div>

            {!objective.done && objective.feedback ? (
              <p className="mt-1.5 pl-[30px] text-[12px] leading-snug text-danger">
                {objective.feedback}
              </p>
            ) : null}

            {showNudges &&
            !objective.done &&
            !objective.feedback &&
            objective.hintOnFail ? (
              <p className="mt-1.5 pl-[30px] text-[12px] leading-snug text-warn/80">
                {objective.hintOnFail}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
};

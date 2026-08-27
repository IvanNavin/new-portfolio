'use client';

import { Check, ShieldAlert, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/cn';

export type ObjectiveStatus = {
  id: string;
  label: string;
  hintOnFail?: string;
  /** A specific correction for a wrong attempt; shown as soon as it exists. */
  feedback?: string | null;
  /** Something to keep intact, not something to reach. */
  constraint?: true;
  done: boolean;
};

type ObjectiveListProps = {
  objectives: ObjectiveStatus[];
  /** Nudges only appear once the player has actually tried and stumbled. */
  showNudges: boolean;
};

const Nudges = ({
  objective,
  showNudges,
}: {
  objective: ObjectiveStatus;
  showNudges: boolean;
}) => (
  <>
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
  </>
);

export const ObjectiveList = ({
  objectives,
  showNudges,
}: ObjectiveListProps) => {
  const steps = objectives.filter((objective) => !objective.constraint);
  const constraints = objectives.filter((objective) => objective.constraint);
  const done = steps.filter((objective) => objective.done).length;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-accent">
            Твоє завдання
          </h3>
          <span className="font-mono text-[11px] text-ink-dim">
            {done}/{steps.length}
          </span>
        </div>

        <ol className="space-y-1.5">
          {steps.map((objective, index) => (
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

              <Nudges objective={objective} showNudges={showNudges} />
            </li>
          ))}
        </ol>
      </div>

      {/* Constraints are true until the player breaks them, so they are listed
          apart: ticking them off as achievements would suggest the mission was
          already partly solved before the first command. */}
      {constraints.length > 0 ? (
        <div>
          <h3 className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
            Не зламай
          </h3>
          <ul className="space-y-1.5">
            {constraints.map((objective) => (
              <li
                key={objective.id}
                className={cn(
                  'rounded-lg border px-2.5 py-2 transition-colors',
                  objective.done
                    ? 'border-edge bg-surface-raised'
                    : 'border-danger/45 bg-danger-soft',
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      'mt-px flex size-5 shrink-0 items-center justify-center',
                      objective.done ? 'text-ink-faint' : 'text-danger',
                    )}
                  >
                    {objective.done ? (
                      <ShieldCheck size={14} strokeWidth={2.2} />
                    ) : (
                      <ShieldAlert size={14} strokeWidth={2.2} />
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-[13px] leading-snug',
                      objective.done ? 'text-ink-faint' : 'text-danger',
                    )}
                  >
                    {objective.label}
                  </span>
                </div>

                <Nudges objective={objective} showNudges={showNudges} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

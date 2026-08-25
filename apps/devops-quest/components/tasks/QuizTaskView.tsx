'use client';

import { Check, X } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { cn } from '@/lib/cn';
import type { QuizTask } from '@/lib/content/types';

import { RichText } from '../mission/RichText';
import { Button } from '../ui/Button';

type QuizTaskViewProps = {
  task: QuizTask;
  onSolved: () => void;
  sidebar: ReactNode;
};

const sameSet = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((item) => b.includes(item));

export const QuizTaskView = ({
  task,
  onSolved,
  sidebar,
}: QuizTaskViewProps) => {
  const [picked, setPicked] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<'right' | 'wrong' | null>(null);

  const toggle = (id: string) => {
    if (verdict === 'right') return;
    setVerdict(null);
    setPicked((current) =>
      task.multi
        ? current.includes(id)
          ? current.filter((each) => each !== id)
          : [...current, id]
        : [id],
    );
  };

  const submit = () => {
    const right = sameSet(picked, task.correct);
    setVerdict(right ? 'right' : 'wrong');
    if (right) onSolved();
  };

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div className="scroll-thin min-h-0 space-y-5 overflow-y-auto pr-1">
        {sidebar}
      </div>

      <div className="scroll-thin min-h-0 overflow-y-auto rounded-xl border border-edge bg-surface-raised p-5">
        <p className="text-[15px] leading-relaxed text-ink">
          <RichText text={task.question} />
        </p>
        {task.multi ? (
          <p className="mt-1 text-[11.5px] text-ink-faint">
            Правильних відповідей може бути кілька.
          </p>
        ) : null}

        <div className="mt-4 space-y-2">
          {task.options.map((option) => {
            const chosen = picked.includes(option.id);
            const reveal = verdict !== null && task.correct.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggle(option.id)}
                className={cn(
                  'flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[13.5px] transition-colors',
                  reveal
                    ? 'border-accent/45 bg-accent-soft text-accent'
                    : chosen
                      ? 'border-info/45 bg-info-soft text-ink'
                      : 'border-edge bg-surface-sunken text-ink-dim hover:border-edge-strong',
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {reveal ? (
                    <Check size={14} />
                  ) : chosen && verdict === 'wrong' ? (
                    <X size={14} />
                  ) : null}
                </span>
                <span>
                  <RichText text={option.label} />
                </span>
              </button>
            );
          })}
        </div>

        {verdict === 'wrong' ? (
          <p className="rise mt-3 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-[13px] text-ink-dim">
            Не те. Перечитай теорію збоку — відповідь там є.
          </p>
        ) : null}

        {verdict === 'right' ? (
          <p className="rise mt-3 rounded-lg border border-accent/25 bg-accent-soft px-3 py-2 text-[13px] leading-relaxed text-ink-dim">
            <RichText text={task.explain} />
          </p>
        ) : null}

        <Button
          variant="primary"
          className="mt-4 w-full"
          onClick={submit}
          disabled={picked.length === 0 || verdict === 'right'}
        >
          Відповісти
        </Button>
      </div>
    </div>
  );
};

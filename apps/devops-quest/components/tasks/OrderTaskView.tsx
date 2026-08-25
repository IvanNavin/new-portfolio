'use client';

import { X } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { cn } from '@/lib/cn';
import type { OrderTask } from '@/lib/content/types';

import { RichText } from '../mission/RichText';
import { Button } from '../ui/Button';

type OrderTaskViewProps = {
  task: OrderTask;
  onSolved: () => void;
  sidebar: ReactNode;
};

/**
 * Click-to-build rather than drag-and-drop: it works with a keyboard, works on
 * touch, and needs no drag library.
 */
export const OrderTaskView = ({
  task,
  onSolved,
  sidebar,
}: OrderTaskViewProps) => {
  const [chosen, setChosen] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<'right' | 'wrong' | null>(null);

  const pool = task.items.filter((item) => !chosen.includes(item.id));
  const labelOf = (id: string) =>
    task.items.find((item) => item.id === id)?.label ?? id;

  const submit = () => {
    const right = chosen.join('|') === task.correct.join('|');
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
          <RichText text={task.instruction} />
        </p>

        <p className="mt-4 text-[11px] uppercase tracking-wider text-ink-faint">
          Твій порядок
        </p>
        <ol className="mt-2 space-y-1.5">
          {chosen.length === 0 ? (
            <li className="rounded-lg border border-dashed border-edge px-3 py-3 text-center text-[12.5px] text-ink-faint">
              Клацай кроки нижче в тому порядку, у якому вони мають виконуватись
            </li>
          ) : null}
          {chosen.map((id, index) => (
            <li
              key={id}
              className={cn(
                'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13.5px]',
                verdict === 'right'
                  ? 'border-accent/40 bg-accent-soft text-accent'
                  : 'border-edge bg-surface-sunken text-ink',
              )}
            >
              <span className="font-mono text-[11.5px] text-ink-faint">
                {index + 1}
              </span>
              <span className="flex-1">
                <RichText text={labelOf(id)} />
              </span>
              {verdict !== 'right' ? (
                <button
                  type="button"
                  aria-label={`Прибрати «${labelOf(id)}»`}
                  onClick={() => {
                    setVerdict(null);
                    setChosen((current) =>
                      current.filter((each) => each !== id),
                    );
                  }}
                  className="text-ink-faint transition-colors hover:text-danger"
                >
                  <X size={14} />
                </button>
              ) : null}
            </li>
          ))}
        </ol>

        {pool.length > 0 ? (
          <>
            <p className="mt-5 text-[11px] uppercase tracking-wider text-ink-faint">
              Кроки
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {pool.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setVerdict(null);
                    setChosen((current) => [...current, item.id]);
                  }}
                  className="rounded-lg border border-edge bg-surface-sunken px-3 py-2 text-left text-[13px] text-ink-dim transition-colors hover:border-edge-strong hover:text-ink"
                >
                  <RichText text={item.label} />
                </button>
              ))}
            </div>
          </>
        ) : null}

        {verdict === 'wrong' ? (
          <p className="rise mt-4 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-[13px] text-ink-dim">
            Порядок не той. Подумай, що фізично не може статися раніше за
            попередній крок.
          </p>
        ) : null}

        {verdict === 'right' ? (
          <p className="rise mt-4 rounded-lg border border-accent/25 bg-accent-soft px-3 py-2 text-[13px] leading-relaxed text-ink-dim">
            <RichText text={task.explain} />
          </p>
        ) : null}

        <Button
          variant="primary"
          className="mt-4 w-full"
          onClick={submit}
          disabled={chosen.length !== task.items.length || verdict === 'right'}
        >
          Перевірити порядок
        </Button>
      </div>
    </div>
  );
};

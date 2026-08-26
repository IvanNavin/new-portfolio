'use client';

import { Eye, HelpCircle } from 'lucide-react';

import { STUCK_LINE } from '@/lib/content/story';

import { Button } from '../ui/Button';

type HintLadderProps = {
  hints: string[];
  used: number;
  onUse: () => void;
  onReveal: () => void;
  revealed: boolean;
  solution: string;
  /** True once the player has failed enough that offering help is fair. */
  offered: boolean;
};

const COST = ['−20% XP', '−35% XP', '−50% XP'];

export const HintLadder = ({
  hints,
  used,
  onUse,
  onReveal,
  revealed,
  solution,
  offered,
}: HintLadderProps) => (
  <div>
    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
      Підказки
    </h3>

    <div className="space-y-1.5">
      {hints.slice(0, used).map((hint, index) => (
        <div
          key={index}
          className="rise rounded-lg border border-info/25 bg-info-soft px-2.5 py-2 text-[12.5px] leading-snug text-ink-dim"
        >
          <span className="mr-1.5 font-mono text-[11px] text-info">
            #{index + 1}
          </span>
          {hint}
        </div>
      ))}
    </div>

    {used < hints.length ? (
      <Button
        size="sm"
        variant={offered ? 'primary' : 'ghost'}
        className="mt-2 w-full"
        onClick={onUse}
      >
        <HelpCircle size={13} />
        {used === 0 ? 'Взяти підказку' : 'Ще підказка'} · {COST[used]}
      </Button>
    ) : !revealed ? (
      <Button
        size="sm"
        variant="danger"
        className="mt-2 w-full"
        onClick={onReveal}
      >
        <Eye size={13} />
        Показати рішення · 1 зірка
      </Button>
    ) : null}

    {revealed ? (
      <pre className="scroll-thin mt-2 overflow-x-auto rounded-lg border border-edge bg-surface-sunken px-2.5 py-2 font-mono text-[12px] leading-relaxed text-accent">
        {solution}
      </pre>
    ) : null}

    {offered && used === 0 ? (
      <p className="mt-1.5 text-[11.5px] leading-snug text-warn/80">
        {STUCK_LINE}
      </p>
    ) : null}
  </div>
);

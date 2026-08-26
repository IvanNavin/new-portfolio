'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

/**
 * Types the narration out a character at a time, the way a story wants to be
 * read rather than skimmed. Clicking finishes it instantly — nobody should be
 * held hostage by an animation — and reduced-motion skips it entirely.
 */
const useTypewriter = (lines: readonly string[], speed = 18) => {
  const total = lines.join('\n').length;
  const [revealed, setRevealed] = useState(0);
  const frame = useRef<number>(undefined);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(total);
      return;
    }

    setRevealed(0);
    const started = performance.now();
    const step = (now: number) => {
      const shown = Math.floor((now - started) / speed);
      setRevealed(Math.min(shown, total));
      if (shown < total) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);

    return () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, [total, speed]);

  return {
    revealed,
    done: revealed >= total,
    finish: () => setRevealed(total),
  };
};

type NarratorProps = {
  lines: readonly string[];
  className?: string;
};

export const Narrator = ({ lines, className }: NarratorProps) => {
  const { revealed, done, finish } = useTypewriter(lines);

  // How many characters precede this line, counting the newline between them.
  const startOf = (index: number): number =>
    lines.slice(0, index).reduce((sum, line) => sum + line.length + 1, 0);

  const shown = lines.map((line, index) =>
    line.slice(0, Math.max(0, revealed - startOf(index))),
  );

  return (
    <section
      className={cn(
        'rise relative rounded-xl border-l-2 border-accent/60 bg-surface-raised/60 py-3 pl-4 pr-4',
        className,
      )}
      onClick={finish}
      role="presentation"
    >
      <p className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
        Оповідач
      </p>

      <div className="space-y-1.5">
        {shown.map((line, index) => (
          <p
            key={lines[index]}
            className="min-h-[1.4em] text-[14px] leading-relaxed text-ink"
          >
            {line}
            {!done && line.length > 0 && line.length < lines[index].length ? (
              <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-accent" />
            ) : null}
          </p>
        ))}
      </div>

      {!done ? (
        <p className="mt-2 text-[11px] text-ink-faint">клацни, щоб не чекати</p>
      ) : null}
    </section>
  );
};

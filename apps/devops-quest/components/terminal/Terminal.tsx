'use client';

import { RotateCcw } from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';

import { Button } from '../ui/Button';
import type { TerminalApi } from './useTerminal';

const STREAM_CLASS: Record<string, string> = {
  stdout: 'text-ink',
  stderr: 'text-danger',
  input: 'text-accent',
  system: 'text-ink-dim',
};

type TerminalProps = {
  terminal: TerminalApi;
  className?: string;
};

export const Terminal = ({ terminal, className }: TerminalProps) => {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [terminal.lines]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      terminal.submit(draft);
      setDraft('');
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setDraft(terminal.recallOlder(draft));
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setDraft(terminal.recallNewer(draft));
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      setDraft(terminal.complete(draft));
      return;
    }
    if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      terminal.submit('clear');
      setDraft('');
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-xl border border-edge bg-surface-sunken',
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-edge bg-surface-raised px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-danger/70" />
          <span className="size-2.5 rounded-full bg-warn/70" />
          <span className="size-2.5 rounded-full bg-accent/70" />
          <span className="ml-2 font-mono text-[11px] text-ink-dim">
            ssh {terminal.state.user}@{terminal.state.hostname}
          </span>
        </div>
        <Button
          size="sm"
          variant="quiet"
          onClick={terminal.reset}
          title="Скинути машину до початкового стану"
        >
          <RotateCcw size={13} />
          Скинути
        </Button>
      </div>

      <div
        ref={scrollRef}
        className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3 py-2.5 font-mono text-[12.5px] leading-[1.55]"
        onClick={() => inputRef.current?.focus()}
      >
        {terminal.lines.map((line) => (
          <div
            key={line.id}
            className={cn(
              'whitespace-pre-wrap break-words',
              STREAM_CLASS[line.stream],
            )}
          >
            {line.text === '' ? ' ' : line.text}
          </div>
        ))}

        <div className="flex items-baseline gap-2">
          <span className="shrink-0 text-accent">{terminal.prompt}</span>
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              aria-label="Командний рядок"
              className="w-full bg-transparent font-mono text-[12.5px] text-ink caret-transparent outline-none"
            />
            <span
              aria-hidden
              className="caret pointer-events-none absolute top-0 select-none text-ink"
              style={{ left: `${draft.length}ch` }}
            >
              ▋
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-edge bg-surface-raised px-3 py-1 font-mono text-[10.5px] text-ink-faint">
        ↑↓ історія · Tab автодоповнення · Ctrl+L очистити · man &lt;команда&gt;
        довідка
      </div>
    </div>
  );
};

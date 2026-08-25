'use client';

import { FileCode2, RotateCcw, ShieldCheck } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

import type { EditorTask } from '@/lib/content/types';

import { ObjectiveList, type ObjectiveStatus } from '../mission/ObjectiveList';
import { Button } from '../ui/Button';

type EditorTaskViewProps = {
  task: EditorTask;
  onSolved: () => void;
  resetToken: number;
  onStruggling: (struggling: boolean) => void;
  sidebar: ReactNode;
};

export const EditorTaskView = ({
  task,
  onSolved,
  resetToken,
  onStruggling,
  sidebar,
}: EditorTaskViewProps) => {
  const [text, setText] = useState(task.starter);
  const [checked, setChecked] = useState<ObjectiveStatus[] | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Unlike the terminal, the editor only grades on demand — writing a config
  // and then validating it is how the real loop works (`nginx -t`, `kubectl
  // apply --dry-run`), and it keeps the answer from appearing mid-keystroke.
  const validate = () => {
    const statuses: ObjectiveStatus[] = task.goals.map((goal) => ({
      id: goal.id,
      label: goal.label,
      hintOnFail: goal.hintOnFail,
      done: goal.check(text),
    }));
    setChecked(statuses);
    const passed = statuses.every((status) => status.done);
    if (passed) onSolved();
    else setAttempts((count) => count + 1);
  };

  useEffect(() => {
    onStruggling(attempts >= 2);
  }, [attempts, onStruggling]);

  useEffect(() => {
    if (resetToken > 0) {
      setText(task.starter);
      setChecked(null);
      setAttempts(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  const objectives: ObjectiveStatus[] =
    checked ??
    task.goals.map((goal) => ({
      id: goal.id,
      label: goal.label,
      hintOnFail: goal.hintOnFail,
      done: false,
    }));

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div className="scroll-thin min-h-0 space-y-5 overflow-y-auto pr-1">
        <ObjectiveList objectives={objectives} showNudges={checked !== null} />
        {sidebar}
      </div>

      <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-edge bg-surface-sunken lg:min-h-0">
        <div className="flex shrink-0 items-center justify-between border-b border-edge bg-surface-raised px-3 py-1.5">
          <span className="flex items-center gap-2 font-mono text-[11.5px] text-ink-dim">
            <FileCode2 size={13} />
            {task.filename}
          </span>
          <Button
            size="sm"
            variant="quiet"
            onClick={() => setText(task.starter)}
          >
            <RotateCcw size={13} />
            Скинути
          </Button>
        </div>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          spellCheck={false}
          aria-label={`Вміст файлу ${task.filename}`}
          className="scroll-thin min-h-0 flex-1 resize-none bg-transparent px-3 py-2.5 font-mono text-[12.5px] leading-[1.6] text-ink outline-none"
        />

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-edge bg-surface-raised px-3 py-2">
          <span className="font-mono text-[11px] text-ink-faint">
            {text.split('\n').length} рядків
            {attempts > 0 ? ` · спроб: ${attempts}` : ''}
          </span>
          <Button size="sm" variant="primary" onClick={validate}>
            <ShieldCheck size={13} />
            Перевірити файл
          </Button>
        </div>
      </div>
    </div>
  );
};

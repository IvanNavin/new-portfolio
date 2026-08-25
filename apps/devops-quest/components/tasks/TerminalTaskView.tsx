'use client';

import { useEffect, useMemo } from 'react';

import type { TerminalTask } from '@/lib/content/types';

import { ObjectiveList, type ObjectiveStatus } from '../mission/ObjectiveList';
import { Terminal } from '../terminal/Terminal';
import { useTerminal } from '../terminal/useTerminal';

type TerminalTaskViewProps = {
  task: TerminalTask;
  onSolved: () => void;
  /** Bumped by the parent to force a fresh machine on "try again". */
  resetToken: number;
  onStruggling: (struggling: boolean) => void;
  sidebar: React.ReactNode;
};

export const TerminalTaskView = ({
  task,
  onSolved,
  resetToken,
  onStruggling,
  sidebar,
}: TerminalTaskViewProps) => {
  const terminal = useTerminal(task);

  const objectives: ObjectiveStatus[] = useMemo(
    () =>
      task.goals.map((goal) => ({
        id: goal.id,
        label: goal.label,
        hintOnFail: goal.hintOnFail,
        done: goal.check(terminal.state),
      })),
    [task.goals, terminal.state],
  );

  const solved =
    objectives.length > 0 && objectives.every((objective) => objective.done);
  // Two stumbles is where a real mentor would step in, not the first typo.
  const struggling = terminal.failures >= 2 && !solved;

  useEffect(() => {
    if (solved) onSolved();
  }, [solved, onSolved]);

  useEffect(() => {
    onStruggling(struggling);
  }, [struggling, onStruggling]);

  useEffect(() => {
    if (resetToken > 0) terminal.reset();
    // Only re-run when the parent asks for a reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      <div className="scroll-thin min-h-0 space-y-5 overflow-y-auto pr-1">
        <ObjectiveList objectives={objectives} showNudges={struggling} />
        {sidebar}
      </div>
      <Terminal terminal={terminal} className="min-h-[420px] lg:min-h-0" />
    </div>
  );
};

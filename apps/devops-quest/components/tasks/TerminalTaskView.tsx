'use client';

import { useEffect, useMemo, useRef } from 'react';

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
        feedback: goal.feedback?.(terminal.state) ?? null,
        done: goal.check(terminal.state),
      })),
    [task.goals, terminal.state],
  );

  const solved =
    objectives.length > 0 && objectives.every((objective) => objective.done);

  // Commands that succeed but achieve nothing are the quiet way to get stuck:
  // there is no error to count, so failures alone would never notice. Track how
  // long it has been since a goal last went green and step in on that too.
  const doneCount = objectives.filter((objective) => objective.done).length;
  const historyLength = terminal.state.history.length;
  const progressAt = useRef(0);
  const lastDoneCount = useRef(doneCount);
  useEffect(() => {
    // Only move the marker when a goal actually went green — updating it on
    // every command would make "commands since progress" permanently zero.
    if (lastDoneCount.current === doneCount) return;
    lastDoneCount.current = doneCount;
    progressAt.current = historyLength;
  }, [doneCount, historyLength]);

  const sinceProgress = historyLength - progressAt.current;
  const struggling = !solved && (terminal.failures >= 2 || sinceProgress >= 3);

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

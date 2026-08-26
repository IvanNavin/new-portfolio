'use client';

import { ArrowLeft, BookOpen, ChevronDown, Play } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';

import { mentorLineFor } from '@/lib/content/mentor';
import {
  getLevelOfMission,
  getMission,
  nextMission,
} from '@/lib/content/registry';
import { rankFor } from '@/lib/progress/rank';
import type { MissionRecord } from '@/lib/progress/types';
import { useProgress } from '@/lib/progress/useProgress';
import { toast } from '@/lib/toasts';

import { MentorSays } from '../mentor/MentorSays';
import { EditorTaskView } from '../tasks/EditorTaskView';
import { OrderTaskView } from '../tasks/OrderTaskView';
import { QuizTaskView } from '../tasks/QuizTaskView';
import { TerminalTaskView } from '../tasks/TerminalTaskView';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { HintLadder } from './HintLadder';
import { MissionResult } from './MissionResult';
import { Theory } from './Theory';

type MissionViewProps = {
  missionId: string;
};

export const MissionView = ({ missionId }: MissionViewProps) => {
  const mission = getMission(missionId);
  if (!mission) throw new Error(`Unknown mission: ${missionId}`);

  const level = getLevelOfMission(mission.id);
  const upcoming = nextMission(mission.id);
  const { complete, xp } = useProgress();

  const [phase, setPhase] = useState<'brief' | 'practice'>('brief');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [struggling, setStruggling] = useState(false);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [record, setRecord] = useState<MissionRecord | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const settled = useRef(false);

  const onSolved = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    // Revealing the solution counts as spending the whole hint ladder.
    const spent = revealed ? 3 : hintsUsed;
    const earned = complete(mission, spent);
    setRecord(earned);

    const before = rankFor(xp);
    const after = rankFor(xp + earned.xp);
    toast('xp', `+${earned.xp} XP`, mission.title);
    if (after.title !== before.title) {
      toast('rank', `Новий ранг: ${after.title}`, after.blurb);
    }
  }, [complete, hintsUsed, mission, revealed, xp]);

  const retry = () => {
    settled.current = false;
    setRecord(null);
    setHintsUsed(0);
    setRevealed(false);
    setStruggling(false);
    setResetToken((token) => token + 1);
  };

  const sidebar = (
    <>
      <HintLadder
        hints={mission.hints}
        used={hintsUsed}
        onUse={() =>
          setHintsUsed((count) => Math.min(count + 1, mission.hints.length))
        }
        onReveal={() => setRevealed(true)}
        revealed={revealed}
        solution={mission.solution}
        offered={struggling}
      />

      <div>
        <button
          type="button"
          onClick={() => setTheoryOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-lg border border-edge bg-surface-raised px-2.5 py-2 text-[12.5px] text-ink-dim hover:border-edge-strong"
        >
          <span className="flex items-center gap-2">
            <BookOpen size={13} />
            Теорія місії
          </span>
          <ChevronDown
            size={14}
            className={
              theoryOpen
                ? 'rotate-180 transition-transform'
                : 'transition-transform'
            }
          />
        </button>
        {theoryOpen ? (
          <div className="mt-2.5">
            <Theory blocks={mission.theory} />
          </div>
        ) : null}
      </div>
    </>
  );

  const taskView = () => {
    switch (mission.task.kind) {
      case 'terminal':
        return (
          <TerminalTaskView
            task={mission.task}
            onSolved={onSolved}
            resetToken={resetToken}
            onStruggling={setStruggling}
            sidebar={sidebar}
          />
        );
      case 'editor':
        return (
          <EditorTaskView
            task={mission.task}
            onSolved={onSolved}
            resetToken={resetToken}
            onStruggling={setStruggling}
            sidebar={sidebar}
          />
        );
      case 'quiz':
        return (
          <QuizTaskView
            task={mission.task}
            onSolved={onSolved}
            sidebar={sidebar}
          />
        );
      case 'order':
        return (
          <OrderTaskView
            task={mission.task}
            onSolved={onSolved}
            sidebar={sidebar}
          />
        );
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={level ? `/level/${level.id}` : '/'}
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink-dim"
          >
            <ArrowLeft size={13} />
            {level?.title ?? 'На карту'}
          </Link>
          <h1 className="mt-0.5 truncate text-lg font-semibold text-ink">
            {mission.title}
          </h1>
        </div>
        <Badge tone="xp">{mission.xp} XP</Badge>
      </header>

      {phase === 'brief' ? (
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl space-y-5 pb-6">
            {mentorLineFor(mission.id) ? (
              <MentorSays>
                <p>{mentorLineFor(mission.id)}</p>
              </MentorSays>
            ) : null}

            <div className="rounded-xl border border-accent/25 bg-accent-soft px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-accent">
                Завдання
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-ink">
                {mission.goal}
              </p>
            </div>

            <Theory blocks={mission.theory} />

            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => setPhase('practice')}
            >
              <Play size={14} />
              Перейти до практики
            </Button>
            <p className="text-center text-[11.5px] text-ink-faint">
              Теорія залишиться під рукою — її можна розгорнути збоку в
              будь-який момент.
            </p>
          </div>
        </div>
      ) : (
        taskView()
      )}

      {record ? (
        <MissionResult
          mission={mission}
          record={record}
          next={upcoming}
          onRetry={retry}
        />
      ) : null}
    </div>
  );
};

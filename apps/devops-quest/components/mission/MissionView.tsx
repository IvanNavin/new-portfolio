'use client';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Play,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getLevelOfMission,
  getMission,
  nextMission,
  stepsOf,
} from '@/lib/content/registry';
import { sceneFor } from '@/lib/content/story';
import { rankFor } from '@/lib/progress/rank';
import type { MissionRecord } from '@/lib/progress/types';
import { useProgress } from '@/lib/progress/useProgress';
import { toast } from '@/lib/toasts';

import { Narrator } from '../story/Narrator';
import { EditorTaskView } from '../tasks/EditorTaskView';
import { OrderTaskView } from '../tasks/OrderTaskView';
import { QuizTaskView } from '../tasks/QuizTaskView';
import { TerminalTaskView } from '../tasks/TerminalTaskView';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Stars } from '../ui/Stars';
import { Confetti } from './Confetti';
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
  const scene = sceneFor(mission.id);
  const steps = stepsOf(mission);
  const upcoming = nextMission(mission.id);
  const { complete, xp } = useProgress();

  const [phase, setPhase] = useState<'brief' | 'practice'>('brief');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [struggling, setStruggling] = useState(false);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const [record, setRecord] = useState<MissionRecord | null>(null);
  // The celebration is a dialog you can close, not a page turn: finishing a
  // mission shouldn't yank you off a terminal you might still be poking at.
  const [resultOpen, setResultOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const settled = useRef(false);

  const onSolved = useCallback(() => {
    if (settled.current) return;
    settled.current = true;
    // Revealing the solution counts as spending the whole hint ladder.
    const spent = revealed ? 3 : hintsUsed;
    const earned = complete(mission, spent);
    setRecord(earned);
    setResultOpen(true);
    setCelebrating(true);

    const before = rankFor(xp);
    const after = rankFor(xp + earned.xp);
    toast('xp', `+${earned.xp} XP`, mission.title);
    if (after.title !== before.title) {
      toast('rank', `Новий ранг: ${after.title}`, after.blurb);
    }
  }, [complete, hintsUsed, mission, revealed, xp]);

  useEffect(() => {
    if (!celebrating) return;
    const timer = window.setTimeout(() => setCelebrating(false), 4200);
    return () => window.clearTimeout(timer);
  }, [celebrating]);

  const retry = () => {
    settled.current = false;
    setRecord(null);
    setResultOpen(false);
    setCelebrating(false);
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
          <div className="mx-auto max-w-2xl space-y-7 pb-6">
            {scene ? <Narrator lines={scene} /> : null}

            <section className="rise" style={{ animationDelay: '120ms' }}>
              <h2 className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink-faint">
                Що каже теорія
              </h2>
              <Theory blocks={mission.theory} />
            </section>

            <section className="rise" style={{ animationDelay: '220ms' }}>
              <h2 className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-accent">
                Твоє завдання
              </h2>
              <p className="mb-3 text-[14px] leading-relaxed text-ink">
                {mission.goal}
              </p>
              <ol className="space-y-2">
                {steps.map((step, index) => (
                  <li
                    key={step}
                    className="rise flex items-start gap-3 rounded-lg border border-edge bg-surface-raised px-3 py-2.5"
                    style={{ animationDelay: `${300 + index * 70}ms` }}
                  >
                    <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-md bg-accent-soft font-mono text-[11px] text-accent">
                      {index + 1}
                    </span>
                    <span className="text-[13.5px] leading-snug text-ink-dim">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => setPhase('practice')}
            >
              <Play size={14} />
              До роботи
            </Button>
            <p className="text-center text-[11.5px] text-ink-faint">
              Теорія й цілі лишаться під рукою — збоку від термінала.
            </p>
          </div>
        </div>
      ) : (
        <>
          {taskView()}

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-edge pt-3">
            {record ? (
              <span className="flex items-center gap-2 text-[12.5px] text-accent">
                <Trophy size={14} />
                Місію виконано
                <Stars value={record.stars} />
                <span className="font-mono text-xp">+{record.xp} XP</span>
              </span>
            ) : (
              <span className="text-[12.5px] text-ink-dim">
                Закрий усі цілі місії, щоб рухатись далі
              </span>
            )}

            <div className="flex items-center gap-2">
              {record ? (
                <Button
                  size="sm"
                  variant="quiet"
                  onClick={() => setResultOpen(true)}
                >
                  Показати результат
                </Button>
              ) : null}

              {upcoming ? (
                record ? (
                  <Link href={`/mission/${upcoming.id}`}>
                    <Button size="sm" variant="primary">
                      Наступна місія
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled
                    title="Спершу виконай усі цілі цієї місії"
                  >
                    Наступна місія
                    <ArrowRight size={14} />
                  </Button>
                )
              ) : null}
            </div>
          </footer>
        </>
      )}

      <Confetti active={celebrating} />

      {record && resultOpen ? (
        <MissionResult
          mission={mission}
          record={record}
          next={upcoming}
          onRetry={retry}
          onStay={() => setResultOpen(false)}
        />
      ) : null}
    </div>
  );
};

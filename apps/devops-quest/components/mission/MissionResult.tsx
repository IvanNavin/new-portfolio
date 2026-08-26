'use client';

import { ArrowRight, Map as MapIcon, RotateCcw } from 'lucide-react';
import Link from 'next/link';

import { heroReaction } from '@/lib/content/story';
import type { Mission } from '@/lib/content/types';
import type { MissionRecord } from '@/lib/progress/types';

import { CharacterSays } from '../story/CharacterSays';
import { Button } from '../ui/Button';
import { Stars } from '../ui/Stars';

type MissionResultProps = {
  mission: Mission;
  record: MissionRecord;
  next: Mission | undefined;
  onRetry: () => void;
  /** Close the dialog without leaving — the terminal stays where it was. */
  onStay: () => void;
};

export const MissionResult = ({
  mission,
  record,
  next,
  onRetry,
  onStay,
}: MissionResultProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-surface-sunken/85 p-4 backdrop-blur-sm"
    onClick={onStay}
    role="presentation"
  >
    <div
      className="rise w-full max-w-md rounded-2xl border border-accent/30 bg-surface-raised p-6 text-center shadow-2xl"
      onClick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="Місію виконано"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
        Місію виконано
      </p>
      <h2 className="mt-2 text-xl font-semibold text-ink">{mission.title}</h2>

      <div className="mt-4 flex items-center justify-center">
        <Stars value={record.stars} className="text-2xl" />
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <div>
          <p className="font-mono text-2xl font-semibold text-xp">
            +{record.xp}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-ink-faint">
            XP
          </p>
        </div>
        <div className="h-8 w-px bg-edge" />
        <div>
          <p className="font-mono text-2xl font-semibold text-ink">
            {record.hintsUsed}
          </p>
          <p className="text-[11px] uppercase tracking-wide text-ink-faint">
            підказок
          </p>
        </div>
      </div>

      <CharacterSays who="hero" className="mt-5 text-left">
        <p>{heroReaction(record.stars, record.hintsUsed)}</p>
      </CharacterSays>

      <div className="mt-3 rounded-lg border border-edge bg-surface-sunken px-3.5 py-3 text-left">
        <p className="text-[11px] uppercase tracking-wide text-ink-faint">
          Тепер ти вмієш
        </p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-ink-dim">
          {mission.goal}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {next ? (
          <Link href={`/mission/${next.id}`} className="w-full">
            <Button variant="primary" className="w-full">
              Наступна місія: {next.title}
              <ArrowRight size={14} />
            </Button>
          </Link>
        ) : (
          <Link href="/" className="w-full">
            <Button variant="primary" className="w-full">
              <MapIcon size={14} />
              Це поки остання місія — на карту
            </Button>
          </Link>
        )}

        <Button variant="ghost" className="w-full" onClick={onStay}>
          Залишитись тут
        </Button>

        <div className="flex gap-2">
          <Button variant="quiet" className="flex-1" onClick={onRetry}>
            <RotateCcw size={13} />
            Пройти знову
          </Button>
          <Link href="/" className="flex-1">
            <Button variant="quiet" className="w-full">
              <MapIcon size={13} />
              До карти
            </Button>
          </Link>
        </div>
      </div>

      {record.stars < 3 ? (
        <p className="mt-3 text-[11.5px] text-ink-faint">
          Три зірки дає проходження без жодної підказки.
        </p>
      ) : null}
    </div>
  </div>
);

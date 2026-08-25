'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { ALL_MISSIONS, LEVELS } from '../content/registry';
import type { Level, Mission } from '../content/types';
import {
  readProgress,
  recordMission,
  resetProgress,
  subscribeProgress,
} from './storage';
import {
  EMPTY_PROGRESS,
  type MissionRecord,
  type Progress,
  type Stars,
  starsForHints,
  totalStars,
  totalXp,
  xpForHints,
} from './types';

/**
 * useSyncExternalStore needs a stable snapshot reference or React re-renders
 * forever, so the parsed progress is cached and invalidated on every write.
 */
let cache: Progress | null = null;

const getSnapshot = (): Progress => {
  if (cache === null) cache = readProgress();
  return cache;
};

const getServerSnapshot = (): Progress => EMPTY_PROGRESS;

const subscribe = (listener: () => void): (() => void) =>
  subscribeProgress(() => {
    cache = null;
    listener();
  });

export type ProgressApi = {
  progress: Progress;
  xp: number;
  stars: number;
  isDone: (missionId: string) => boolean;
  recordOf: (missionId: string) => MissionRecord | undefined;
  isMissionUnlocked: (missionId: string) => boolean;
  isLevelUnlocked: (levelId: string) => boolean;
  levelStats: (level: Level) => { done: number; total: number; stars: number };
  complete: (mission: Mission, hintsUsed: number) => MissionRecord;
  reset: () => void;
};

export const useProgress = (): ProgressApi => {
  const progress = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const isDone = useCallback(
    (missionId: string) => progress.missions[missionId] !== undefined,
    [progress],
  );

  const isMissionUnlocked = useCallback(
    (missionId: string) => {
      const index = ALL_MISSIONS.findIndex(
        (mission) => mission.id === missionId,
      );
      if (index <= 0) return index === 0;
      // Linear gating: finish the one before, and the next opens.
      return progress.missions[ALL_MISSIONS[index - 1].id] !== undefined;
    },
    [progress],
  );

  const isLevelUnlocked = useCallback(
    (levelId: string) => {
      const level = LEVELS.find((each) => each.id === levelId);
      if (!level) return false;
      return isMissionUnlocked(level.missions[0].id);
    },
    [isMissionUnlocked],
  );

  const levelStats = useCallback(
    (level: Level) => {
      const records = level.missions.map(
        (mission) => progress.missions[mission.id],
      );
      return {
        done: records.filter(Boolean).length,
        total: level.missions.length,
        stars: records.reduce((sum, record) => sum + (record?.stars ?? 0), 0),
      };
    },
    [progress],
  );

  const complete = useCallback(
    (mission: Mission, hintsUsed: number): MissionRecord => {
      const record: MissionRecord = {
        stars: starsForHints(hintsUsed) as Stars,
        hintsUsed,
        xp: xpForHints(mission.xp, hintsUsed),
        at: Date.now(),
      };
      recordMission(mission.id, record);
      return record;
    },
    [],
  );

  return {
    progress,
    xp: totalXp(progress),
    stars: totalStars(progress),
    isDone,
    recordOf: (missionId: string) => progress.missions[missionId],
    isMissionUnlocked,
    isLevelUnlocked,
    levelStats,
    complete,
    reset: resetProgress,
  };
};

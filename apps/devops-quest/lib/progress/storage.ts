import { EMPTY_PROGRESS, type MissionRecord, type Progress } from './types';

const KEY = 'devops-quest:progress:v1';
const EVENT = 'devops-quest:progress';

/**
 * localStorage is the source of truth so the game works with no account at
 * all; the database is only a mirror for people who sign in. Same split as
 * devpulse's lib/storage.ts, including the same-tab CustomEvent — the native
 * `storage` event only fires in OTHER tabs.
 */
export const readProgress = (): Progress => {
  if (typeof window === 'undefined') return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'missions' in parsed &&
      typeof (parsed as Progress).missions === 'object'
    ) {
      return { v: 1, missions: (parsed as Progress).missions };
    }
  } catch {
    // Corrupted or quota-blocked storage must not take the game down.
  }
  return EMPTY_PROGRESS;
};

export const writeProgress = (progress: Progress): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Private mode / quota exceeded — the run still finishes, it just won't persist.
  }
  window.dispatchEvent(new CustomEvent(EVENT));
};

export const recordMission = (
  missionId: string,
  record: MissionRecord,
): Progress => {
  const progress = readProgress();
  const existing = progress.missions[missionId];
  // Replaying a mission can only improve the record, never worsen it.
  const next: Progress =
    existing && existing.xp >= record.xp && existing.stars >= record.stars
      ? progress
      : { v: 1, missions: { ...progress.missions, [missionId]: record } };
  writeProgress(next);
  return next;
};

export const resetProgress = (): void => {
  writeProgress(EMPTY_PROGRESS);
};

export const subscribeProgress = (listener: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener('storage', listener);
  };
};

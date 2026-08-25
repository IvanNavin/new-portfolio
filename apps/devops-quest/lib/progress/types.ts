export type Stars = 1 | 2 | 3;

export type MissionRecord = {
  stars: Stars;
  hintsUsed: number;
  xp: number;
  /** Epoch ms of completion. */
  at: number;
};

/**
 * Total XP is derived, never stored — a stored total can drift out of sync
 * with the per-mission records after a merge, and then the HUD lies.
 */
export type Progress = {
  v: 1;
  missions: Record<string, MissionRecord>;
};

export const EMPTY_PROGRESS: Progress = { v: 1, missions: {} };

export const totalXp = (progress: Progress): number =>
  Object.values(progress.missions).reduce((sum, record) => sum + record.xp, 0);

export const totalStars = (progress: Progress): number =>
  Object.values(progress.missions).reduce(
    (sum, record) => sum + record.stars,
    0,
  );

/** Stars fall as hints are spent. Revealing the solution is worth one star. */
export const starsForHints = (hintsUsed: number): Stars =>
  hintsUsed === 0 ? 3 : hintsUsed === 1 ? 2 : 1;

/** Each hint costs a slice of the mission's XP; never drops below a third. */
export const xpForHints = (baseXp: number, hintsUsed: number): number => {
  const multiplier = [1, 0.8, 0.65, 0.5][Math.min(hintsUsed, 3)];
  return Math.round(baseXp * multiplier);
};

/** Keep the better run when local and server records disagree. */
export const mergeProgress = (a: Progress, b: Progress): Progress => {
  const missions: Record<string, MissionRecord> = { ...a.missions };
  for (const [id, record] of Object.entries(b.missions)) {
    const existing = missions[id];
    if (!existing || record.xp > existing.xp || record.stars > existing.stars) {
      missions[id] = record;
    }
  }
  return { v: 1, missions };
};

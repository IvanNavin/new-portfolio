import { describe, expect, it } from 'vitest';

import {
  levelsWithoutLines,
  MISSION_LINES,
  missionsWithoutLines,
  praiseFor,
} from './mentor';

describe('Тарас', () => {
  it('has a line for every mission', () => {
    expect(missionsWithoutLines()).toEqual([]);
  });

  it('has a line for every level', () => {
    expect(levelsWithoutLines()).toEqual([]);
  });

  it('never repeats the same line for two missions', () => {
    const lines = Object.values(MISSION_LINES);
    expect(new Set(lines).size).toBe(lines.length);
  });

  it('reacts differently to a clean run and a helped one', () => {
    expect(praiseFor(3, 0)).not.toBe(praiseFor(1, 2));
  });
});

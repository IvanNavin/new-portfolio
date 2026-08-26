import { describe, expect, it } from 'vitest';

import {
  heroReaction,
  levelsWithoutScenes,
  missionsWithoutScenes,
  SCENES,
} from './story';

describe('the story', () => {
  it('narrates every mission', () => {
    expect(missionsWithoutScenes()).toEqual([]);
  });

  it('narrates every level', () => {
    expect(levelsWithoutScenes()).toEqual([]);
  });

  it('never reuses a scene for two missions', () => {
    const scenes = Object.values(SCENES).map((lines) => lines.join(' '));
    expect(new Set(scenes).size).toBe(scenes.length);
  });

  it('keeps scenes short enough to read before the work starts', () => {
    for (const [id, lines] of Object.entries(SCENES)) {
      expect(lines.length, id).toBeLessThanOrEqual(3);
      expect(lines.join(' ').length, id).toBeLessThanOrEqual(320);
    }
  });

  it('has Тарас react differently to a clean run and a helped one', () => {
    expect(heroReaction(3, 0)).not.toBe(heroReaction(1, 2));
  });
});

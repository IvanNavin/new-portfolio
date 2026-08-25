import { describe, expect, it } from 'vitest';

import { runLine } from '../shell/run';
import type { ShellState } from '../shell/types';
import { ALL_MISSIONS, getMission, LEVELS, nextMission } from './registry';

/** Replay a mission's own solution and demand every goal turns green. */
const play = (state: ShellState, script: string): ShellState => {
  let current = state;
  for (const line of script.split('\n')) {
    if (line.trim() === '') continue;
    current = runLine(current, line).state;
  }
  return current;
};

describe('content registry', () => {
  it('has unique ids and non-empty missions', () => {
    const ids = ALL_MISSIONS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const level of LEVELS) {
      expect(level.missions.length).toBeGreaterThan(0);
    }
  });

  it('gives every mission three hints and a solution', () => {
    for (const mission of ALL_MISSIONS) {
      expect(mission.hints).toHaveLength(3);
      expect(mission.hints.every((hint) => hint.trim().length > 0)).toBe(true);
      expect(mission.solution.trim().length).toBeGreaterThan(0);
      expect(mission.theory.length).toBeGreaterThan(0);
    }
  });

  it('walks from one mission to the next in order', () => {
    expect(nextMission(ALL_MISSIONS[0].id)?.id).toBe(ALL_MISSIONS[1]?.id);
    expect(
      nextMission(ALL_MISSIONS[ALL_MISSIONS.length - 1].id),
    ).toBeUndefined();
  });

  // The important one: a mission whose printed solution doesn't satisfy its own
  // goals is a broken mission, and this catches it before a player does.
  it.each(
    ALL_MISSIONS.filter((m) => m.task.kind === 'terminal').map(
      (m) => [m.id] as const,
    ),
  )('%s is solvable by its own solution', (id) => {
    const mission = getMission(id);
    if (!mission || mission.task.kind !== 'terminal')
      throw new Error('not a terminal mission');
    const final = play(mission.task.boot(), mission.solution);
    const failed = mission.task.goals.filter((goal) => !goal.check(final));
    expect(failed.map((goal) => goal.id)).toEqual([]);
  });

  // Editor missions state their answer as the finished file, so the same
  // self-consistency rule applies: the printed solution must pass every goal.
  it.each(
    ALL_MISSIONS.filter((m) => m.task.kind === 'editor').map(
      (m) => [m.id] as const,
    ),
  )('%s (editor) is solved by its own solution', (id) => {
    const mission = getMission(id);
    if (!mission || mission.task.kind !== 'editor')
      throw new Error('not an editor mission');
    const failed = mission.task.goals.filter(
      (goal) => !goal.check(mission.solution),
    );
    expect(failed.map((goal) => goal.id)).toEqual([]);
  });

  it('quiz and order missions reference option ids that exist', () => {
    for (const mission of ALL_MISSIONS) {
      if (mission.task.kind === 'quiz') {
        const ids = mission.task.options.map((option) => option.id);
        expect(mission.task.correct.length).toBeGreaterThan(0);
        for (const correct of mission.task.correct)
          expect(ids).toContain(correct);
      }
      if (mission.task.kind === 'order') {
        const ids = mission.task.items.map((item) => item.id);
        expect(mission.task.correct).toHaveLength(ids.length);
        for (const correct of mission.task.correct)
          expect(ids).toContain(correct);
      }
    }
  });

  it('numbers every level and mission id consistently', () => {
    for (const level of LEVELS) {
      for (const mission of level.missions) {
        expect(mission.id.startsWith(`${level.id}-`)).toBe(true);
      }
      expect([1, 2, 3, 4]).toContain(level.act);
    }
  });
});

import { describe, expect, it } from 'vitest';

import { ALL_MISSIONS, LEVELS } from './registry';
import type { Mission, TheoryBlock } from './types';

/**
 * A mission may only ask for what the player has already been taught.
 *
 * This walks the curriculum in order and, for every command a mission's own
 * solution uses, asserts that the command was introduced in the theory of that
 * mission or of an earlier one. Getting this wrong is invisible in a code
 * review and obvious to a learner on their first evening, so it is a test.
 */

/** Shell words that are syntax or arguments, never a command to teach. */
const NOT_COMMANDS = new Set([
  'sudo',
  'then',
  'else',
  'fi',
  'do',
  'done',
  'if',
  'while',
  'for',
  '#',
]);

const stripComment = (line: string): string => {
  // Only a `#` that starts a word is a comment; `id_ed25519#1` is not.
  const index = line.search(/(^|\s)#/);
  return index === -1 ? line : line.slice(0, index);
};

/** Every command name a shell script actually invokes. */
export const commandsUsedIn = (script: string): string[] => {
  const found = new Set<string>();

  for (const rawLine of script.split('\n')) {
    const line = stripComment(rawLine).trim();
    if (line === '') continue;

    for (const segment of line.split(/\||&&|\|\||;/)) {
      const words = segment.trim().split(/\s+/).filter(Boolean);
      let index = 0;
      // Skip `sudo` and any leading VAR=value assignments.
      while (
        index < words.length &&
        (words[index] === 'sudo' ||
          /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[index]))
      ) {
        index += 1;
      }
      const head = words[index];
      if (!head) continue;
      if (head.startsWith('>') || head.startsWith('<') || head.startsWith('-'))
        continue;
      if (NOT_COMMANDS.has(head)) continue;
      found.add(head);
    }
  }

  return [...found];
};

/** All the prose, code and table text of one theory block. */
const textOf = (block: TheoryBlock): string => {
  switch (block.kind) {
    case 'text':
    case 'note':
      return block.text;
    case 'code':
      return block.lines.join('\n');
    case 'table':
      return block.rows
        .map(([term, description]) => `${term} ${description}`)
        .join('\n');
  }
};

const taughtTextOf = (mission: Mission): string => {
  const parts = mission.theory.map(textOf);
  // Hints and the printed solution do not count as teaching: a player who
  // solves it unaided must have had the command explained beforehand.
  if (mission.task.kind === 'terminal') {
    parts.push(
      ...mission.task.goals.map(
        (goal) => `${goal.label} ${goal.hintOnFail ?? ''}`,
      ),
    );
  }
  return parts.join('\n');
};

/** Does `haystack` introduce `command` as a standalone word? */
const teaches = (haystack: string, command: string): boolean => {
  const escaped = command.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&');
  return new RegExp(`(^|[^\\w-])${escaped}([^\\w-]|$)`).test(haystack);
};

/** Every `-x` / `--long` flag a script passes, paired with its command. */
export const flagsUsedIn = (
  script: string,
): { command: string; flag: string; cluster: string }[] => {
  const found: { command: string; flag: string; cluster: string }[] = [];

  for (const rawLine of script.split('\n')) {
    const line = stripComment(rawLine).trim();
    if (line === '') continue;

    for (const segment of line.split(/\||&&|\|\||;/)) {
      const words = segment.trim().split(/\s+/).filter(Boolean);
      let index = 0;
      while (index < words.length && words[index] === 'sudo') index += 1;
      const command = words[index];
      if (!command || command.startsWith('-')) continue;

      for (const word of words.slice(index + 1)) {
        if (!word.startsWith('-') || word === '-') continue;
        if (word.startsWith('--')) {
          const flag = word.split('=')[0];
          found.push({ command, flag, cluster: flag });
        } else {
          // Short flags combine: -la is -l and -a. Teaching the cluster whole
          // (`ss -tulpn`) counts, so carry it alongside each letter.
          for (const letter of word.slice(1)) {
            found.push({ command, flag: `-${letter}`, cluster: word });
          }
        }
      }
    }
  }

  return found;
};

/** Shell syntax a solution can rely on, and the phrase that introduces it. */
const OPERATORS: { token: string; label: string }[] = [
  { token: '>>', label: 'дописування в кінець файлу (>>)' },
  { token: '|', label: 'пайп (|)' },
];

describe('theory covers the practice', () => {
  // Build the running "already taught" text as we walk the curriculum in order.
  const taughtBefore: string[] = [];
  const cases: { mission: Mission; taught: string }[] = [];

  for (const level of LEVELS) {
    for (const mission of level.missions) {
      cases.push({
        mission,
        taught: [...taughtBefore, level.brief, taughtTextOf(mission)].join(
          '\n',
        ),
      });
      taughtBefore.push(level.brief, taughtTextOf(mission));
    }
  }

  it.each(
    cases
      .filter(({ mission }) => mission.task.kind === 'terminal')
      .map(({ mission, taught }) => [mission.id, mission, taught] as const),
  )('%s asks only for commands already taught', (_id, mission, taught) => {
    const untaught = commandsUsedIn(mission.solution).filter(
      (command) => !teaches(taught, command),
    );
    expect(untaught).toEqual([]);
  });

  it.each(
    cases
      .filter(({ mission }) => mission.task.kind === 'terminal')
      .map(({ mission, taught }) => [mission.id, mission, taught] as const),
  )('%s uses only flags already explained', (_id, mission, taught) => {
    const untaught = flagsUsedIn(mission.solution)
      .filter(
        ({ flag, cluster }) =>
          !teaches(taught, flag) && !teaches(taught, cluster),
      )
      .map(({ command, flag }) => `${command} ${flag}`);
    expect([...new Set(untaught)]).toEqual([]);
  });

  it.each(
    cases
      .filter(({ mission }) => mission.task.kind === 'terminal')
      .map(({ mission, taught }) => [mission.id, mission, taught] as const),
  )('%s uses only shell syntax already explained', (_id, mission, taught) => {
    const stripped = mission.solution.split('\n').map(stripComment).join('\n');
    const untaught = OPERATORS.filter(
      ({ token }) => stripped.includes(token) && !taught.includes(token),
    ).map(({ label }) => label);
    expect(untaught).toEqual([]);
  });

  it('every mission id appears exactly once in the walk', () => {
    expect(cases).toHaveLength(ALL_MISSIONS.length);
  });
});

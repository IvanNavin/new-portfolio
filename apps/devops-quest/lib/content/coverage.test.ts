import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { scramble } from '../scramble';
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

/**
 * Only the theory counts as teaching — not hints, not the printed solution, and
 * not the goal labels either. A goal that names a command the player was never
 * shown is the bug, not the lesson.
 */
const taughtTextOf = (mission: Mission): string =>
  mission.theory.map(textOf).join('\n');

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

  // `usermod -aG deployers ci` was demonstrated; the task then asked for two
  // groups at once. That they are comma-joined, and that a space breaks it, was
  // written nowhere — so the only route was to guess the punctuation.
  it.each(
    cases
      .filter(({ mission }) => mission.task.kind === 'terminal')
      .map(({ mission, taught }) => [mission.id, mission, taught] as const),
  )(
    '%s demonstrates any compound argument it expects',
    (_id, mission, taught) => {
      const compound = new Set<string>();
      for (const rawLine of mission.solution.split('\n')) {
        for (const word of stripComment(rawLine).trim().split(/\s+/)) {
          if (word.includes(',') && !word.startsWith('-')) compound.add(word);
        }
      }

      const shownWith =
        taught +
        (mission.task.kind === 'terminal'
          ? mission.task.goals.map((goal) => goal.label).join('\n')
          : '');

      const undemonstrated = [...compound].filter(
        (word) => !shownWith.includes(word),
      );
      expect(undemonstrated).toEqual([]);
    },
  );

  it('every mission id appears exactly once in the walk', () => {
    expect(cases).toHaveLength(ALL_MISSIONS.length);
  });
});

describe('goals that grade a written answer explain a wrong one', () => {
  const dir = join(process.cwd(), 'lib/content/levels');
  const files = readdirSync(dir).filter((name) => name.endsWith('.ts'));

  // Comparing a file's contents to an expected string inside a bare `check:` is
  // the shape that leaves a learner staring at a grey checkbox with no idea the
  // answer itself was wrong. `answerFile()` pairs that check with feedback, so
  // it is the only sanctioned way to write one.
  it.each(files)(
    '%s uses answerFile() instead of a bare content check',
    (name) => {
      const source = readFileSync(join(dir, name), 'utf8');
      const offenders = source
        .split('\n')
        .map((line, index) => ({ line: line.trim(), number: index + 1 }))
        .filter(({ line }) => line.includes("?? '').trim() ==="))
        .map(({ number }) => `${name}:${number}`);
      expect(offenders).toEqual([]);
    },
  );

  it('actually found the level files', () => {
    expect(files.length).toBe(12);
  });
});

describe('every mission shows the work, not just names it', () => {
  /** Only runnable-looking theory counts: code blocks and table terms. */
  const demonstratedIn = (blocks: TheoryBlock[]): string =>
    blocks
      .map((block) =>
        block.kind === 'code'
          ? block.lines.join('\n')
          : block.kind === 'table'
            ? block.rows.map(([term]) => term).join('\n')
            : '',
      )
      .join('\n');

  // A lesson can describe a problem beautifully and still leave the player with
  // no idea which keys to press. l02-m03 explained why a 644 `.env` is a
  // disaster, showed the good and bad `ls -l`, and never once wrote `chmod`.
  it.each(
    ALL_MISSIONS.filter((mission) => mission.task.kind === 'terminal').map(
      (mission) => [mission.id, mission] as const,
    ),
  )('%s writes out at least one command it asks for', (_id, mission) => {
    const used = commandsUsedIn(mission.solution);
    const shown = demonstratedIn(mission.theory);
    const demonstrated = used.filter((command) => teaches(shown, command));
    expect(
      demonstrated.length,
      `uses [${used.join(', ')}] but shows none`,
    ).toBeGreaterThan(0);
  });
});

/**
 * A mission must not open already solved.
 *
 * l02-m05 asked the player to give a directory 755 while booting it at 755, so
 * half the checklist was ticked before the first command; l12-m02 wrote both
 * answers into the starter file's own comments. Neither is visible by reading
 * the mission — you have to run the checks against the untouched machine.
 *
 * Goals that guard something instead of asking for it — «don't kill the
 * database» — are the deliberate exception, and say so with `constraint: true`.
 * Those are held to the opposite rule: they must start out satisfied, or the
 * player is told not to break something that is already broken.
 */
describe('missions start unsolved', () => {
  const terminalMissions = ALL_MISSIONS.filter(
    (mission) => mission.task.kind === 'terminal',
  ).map((mission) => [mission.id, mission] as const);

  it.each(terminalMissions)('%s has nothing done for free', (_id, mission) => {
    if (mission.task.kind !== 'terminal') throw new Error('not terminal');
    const booted = mission.task.boot();
    const free = mission.task.goals
      .filter((goal) => goal.constraint === undefined)
      .filter((goal) => goal.check(structuredClone(booted)))
      .map((goal) => `${goal.id}: ${goal.label}`);
    expect(free).toEqual([]);
  });

  it.each(terminalMissions)(
    '%s starts with constraints intact',
    (_id, mission) => {
      if (mission.task.kind !== 'terminal') throw new Error('not terminal');
      const booted = mission.task.boot();
      const broken = mission.task.goals
        .filter((goal) => goal.constraint === true)
        .filter((goal) => !goal.check(structuredClone(booted)))
        .map((goal) => `${goal.id}: ${goal.label}`);
      expect(broken).toEqual([]);
    },
  );

  const editorMissions = ALL_MISSIONS.filter(
    (mission) => mission.task.kind === 'editor',
  ).map((mission) => [mission.id, mission] as const);

  it.each(editorMissions)('%s starter answers nothing', (_id, mission) => {
    if (mission.task.kind !== 'editor') throw new Error('not editor');
    const starter = mission.task.starter;
    const free = mission.task.goals
      .filter((goal) => goal.constraint === undefined)
      .filter((goal) => goal.check(starter))
      .map((goal) => `${goal.id}: ${goal.label}`);
    expect(free).toEqual([]);
  });

  it.each(editorMissions)(
    '%s starter keeps constraints true',
    (_id, mission) => {
      if (mission.task.kind !== 'editor') throw new Error('not editor');
      const broken = mission.task.goals
        .filter((goal) => goal.constraint === true)
        .filter(
          (goal) =>
            !goal.check(
              mission.task.kind === 'editor' ? mission.task.starter : '',
            ),
        )
        .map((goal) => `${goal.id}: ${goal.label}`);
      expect(broken).toEqual([]);
    },
  );
});

/**
 * An ordering task must not be shown already in the right order.
 *
 * l03-m04 listed its six diagnosis steps exactly as `correct` listed them,
 * because that is how the mission is written and read. On screen it meant
 * clicking the steps top to bottom solved it — the same «already half-done»
 * failure as a pre-satisfied goal, in a different disguise. The view scrambles
 * them now; this pins that the scramble is applied and never lands on the
 * answer.
 */
describe('ordering tasks are shown scrambled', () => {
  const orderMissions = ALL_MISSIONS.filter(
    (mission) => mission.task.kind === 'order',
  ).map((mission) => [mission.id, mission] as const);

  it('found the ordering missions', () => {
    expect(orderMissions.length).toBeGreaterThanOrEqual(3);
  });

  it.each(orderMissions)(
    '%s is not presented in solved order',
    (_id, mission) => {
      if (mission.task.kind !== 'order') throw new Error('not an order task');
      const { items, correct } = mission.task;
      const shown = scramble(
        items,
        correct,
        (item) => item.id,
        items.map((item) => item.id).join(','),
      );
      expect(shown.map((item) => item.id)).not.toEqual([...correct]);
      // Every step is still on offer, exactly once.
      expect([...shown.map((item) => item.id)].sort()).toEqual(
        [...items.map((item) => item.id)].sort(),
      );
    },
  );

  it('scrambles the same way every time, so hydration agrees', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
    const once = scramble(items, ['a', 'b', 'c', 'd'], (i) => i.id, 'seed');
    const twice = scramble(items, ['a', 'b', 'c', 'd'], (i) => i.id, 'seed');
    expect(once).toEqual(twice);
  });
});

/**
 * The player spends most of the time being wrong, so the wrong path has to
 * teach too.
 *
 * An editor mission grades only when asked and shows nothing else — no error
 * output, no partial state. A failing goal with nothing to say leaves the
 * player staring at a red line with no idea which part of the file is wrong.
 * Fourteen of them had no `hintOnFail` at all.
 */
describe('a failing goal always has something to say', () => {
  it.each(
    ALL_MISSIONS.filter((mission) => mission.task.kind === 'editor').map(
      (mission) => [mission.id, mission] as const,
    ),
  )('%s tells the player what is missing', (_id, mission) => {
    if (mission.task.kind !== 'editor') throw new Error('not editor');
    const mute = mission.task.goals
      .filter((goal) => goal.constraint === undefined)
      .filter((goal) => (goal.hintOnFail ?? '').trim() === '')
      .map((goal) => goal.id);
    expect(mute).toEqual([]);
  });
});

/**
 * A quiz must reward understanding, not test-taking.
 *
 * In three of them the right answer was the longest option by twenty-odd
 * characters, because it was the only one written out fully while the
 * distractors were throwaway one-liners. Picking the longest is a habit every
 * student has; it should not work here.
 */
describe('quiz answers cannot be guessed by shape', () => {
  it.each(
    ALL_MISSIONS.filter((mission) => mission.task.kind === 'quiz').map(
      (mission) => [mission.id, mission] as const,
    ),
  )('%s does not make the answer the longest option', (_id, mission) => {
    if (mission.task.kind !== 'quiz') throw new Error('not a quiz');
    const longest = Math.max(
      ...mission.task.options.map((option) => option.label.length),
    );
    const everyAnswerIsLongest = mission.task.correct.every(
      (id) =>
        mission.task.kind === 'quiz' &&
        mission.task.options.find((option) => option.id === id)!.label
          .length === longest,
    );
    expect(everyAnswerIsLongest).toBe(false);
  });
});

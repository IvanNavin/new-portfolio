import { readFile } from '../shell/fs';
import type { Goal } from './types';

/**
 * Goals that ask the player to write an answer into a file.
 *
 * These are the ones where a beginner gets stuck in silence: the command runs,
 * the shell prints nothing, no error is raised — and the checklist just stays
 * grey with no clue that the answer itself was wrong. So this helper always
 * pairs the check with feedback that fires the moment the file exists and
 * holds the wrong thing.
 */

const shorten = (value: string): string => {
  const single = value.replace(/\s+/g, ' ');
  return single.length > 44 ? `${single.slice(0, 44)}…` : single;
};

export type AnswerFileGoal = {
  id: string;
  /** Absolute path the player must write. */
  path: string;
  label: string;
  /** Exactly what the file must contain, ignoring surrounding whitespace. */
  expected: string;
  /** Also used as the correction once a wrong answer is on disk. */
  hintOnFail: string;
  /** A sharper correction for a mistake worth naming. Wins over hintOnFail. */
  diagnose?: (value: string) => string | null;
};

export const answerFile = ({
  id,
  path,
  label,
  expected,
  hintOnFail,
  diagnose,
}: AnswerFileGoal): Goal => ({
  id,
  label,
  hintOnFail,
  feedback: (state) => {
    const written = readFile(state.fs, path);
    if (written === null) return null; // not attempted yet — stay quiet
    const value = written.trim();
    if (value === expected) return null;
    if (value === '') return 'Файл порожній — у ньому має бути відповідь.';
    return (
      diagnose?.(value) ?? `Зараз у файлі «${shorten(value)}». ${hintOnFail}`
    );
  },
  expected,
  check: (state) => (readFile(state.fs, path) ?? '').trim() === expected,
});

/** The mistake behind most wrong answers: writing the name instead of the value. */
export const notTheKey =
  (key: string) =>
  (value: string): string | null => {
    if (value === key) {
      return `Це назва, а не значення. Потрібне те, що стоїть праворуч від «=» у рядку ${key}=...`;
    }
    if (value.includes('=')) {
      return 'Це весь рядок. Залиш тільки частину після «=».';
    }
    return null;
  };

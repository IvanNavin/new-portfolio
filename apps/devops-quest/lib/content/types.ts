import type { ShellState } from '../shell/types';

/** Short theory blocks. Deliberately small — this is the ~20% of a mission. */
export type TheoryBlock =
  | { kind: 'text'; text: string }
  | { kind: 'code'; lines: string[]; caption?: string }
  | { kind: 'note'; text: string }
  | { kind: 'table'; caption?: string; rows: [string, string][] };

/**
 * A goal is an ordinary predicate over the machine state. No DSL, no matcher
 * objects: if you can express the check in TypeScript, it is a valid goal.
 */
export type Goal = {
  id: string;
  label: string;
  /** Shown when the player has attempts on the board but this is still red. */
  hintOnFail?: string;
  check: (state: ShellState) => boolean;
};

export type TerminalTask = {
  kind: 'terminal';
  boot: () => ShellState;
  /** Lines printed into the scrollback before the first prompt. */
  intro?: string[];
  goals: Goal[];
};

export type EditorGoal = {
  id: string;
  label: string;
  hintOnFail?: string;
  check: (text: string) => boolean;
};

export type EditorTask = {
  kind: 'editor';
  filename: string;
  language: 'dockerfile' | 'yaml' | 'nginx' | 'bash' | 'ini';
  starter: string;
  goals: EditorGoal[];
};

export type QuizTask = {
  kind: 'quiz';
  question: string;
  multi?: boolean;
  options: { id: string; label: string }[];
  correct: string[];
  explain: string;
};

export type OrderTask = {
  kind: 'order';
  instruction: string;
  items: { id: string; label: string }[];
  /** Item ids in the right order. */
  correct: string[];
  explain: string;
};

export type Task = TerminalTask | EditorTask | QuizTask | OrderTask;

export type Mission = {
  id: string;
  title: string;
  /** One sentence: what the machine looks like when you're done. */
  goal: string;
  theory: TheoryBlock[];
  task: Task;
  /** Three rungs: nudge, strategy, almost-the-answer. */
  hints: [string, string, string];
  solution: string;
  xp: number;
};

export type Level = {
  id: string;
  act: number;
  title: string;
  subtitle: string;
  brief: string;
  missions: Mission[];
};

export type Act = {
  id: number;
  title: string;
  subtitle: string;
};

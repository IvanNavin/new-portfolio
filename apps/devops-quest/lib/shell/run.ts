import { COMMANDS } from './commands';
import { dirname, getDir, readFile, resolvePath, writeFile } from './fs';
import { parseLine, type SimpleCommand } from './parse';
import type { CommandResult, ShellState } from './types';

export type OutputLine = {
  text: string;
  stream: 'stdout' | 'stderr' | 'input' | 'system';
};

export type RunResult = {
  state: ShellState;
  output: OutputLine[];
  /** True when the command asked to wipe the scrollback. */
  cleared: boolean;
};

const toLines = (text: string, stream: OutputLine['stream']): OutputLine[] =>
  text === ''
    ? []
    : text
        .replace(/\n$/, '')
        .split('\n')
        .map((line) => ({ text: line, stream }));

const ASSIGNMENT = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/s;

/**
 * Run one `cmd arg arg` node. `state` is already a private clone, so commands
 * are free to mutate it in place and hand it back — that keeps every command
 * body short instead of threading immutable copies through by hand.
 */
const execSimple = (
  state: ShellState,
  command: SimpleCommand,
  stdin: string,
): CommandResult => {
  let argv = [...command.argv];
  let working = state;

  // Leading NAME=value pairs: permanent when alone, scoped when they prefix a
  // command — same as a real shell.
  const assignments: [string, string][] = [];
  while (argv.length > 0) {
    const match = ASSIGNMENT.exec(argv[0]);
    if (!match) break;
    assignments.push([match[1], match[2]]);
    argv = argv.slice(1);
  }

  if (argv.length === 0) {
    for (const [name, value] of assignments) working.env[name] = value;
    return { state: working, stdout: '', stderr: '', code: 0 };
  }

  const savedEnv = { ...working.env };
  for (const [name, value] of assignments) working.env[name] = value;

  // `sudo` is handled here rather than as a registered command so it can reuse
  // the executor without the command registry importing it back.
  let sudoUser: string | null = null;
  if (argv[0] === 'sudo') {
    const rest = argv.slice(1).filter((a) => a !== '-i' && a !== '-s');
    if (rest.length === 0) {
      return {
        state: working,
        stdout: '',
        stderr: 'usage: sudo command',
        code: 1,
      };
    }
    const account = working.users[working.user];
    const allowed =
      working.user === 'root' ||
      account?.groups.includes('sudo') ||
      account?.groups.includes('wheel');
    if (!allowed) {
      return {
        state: working,
        stdout: '',
        stderr: `${working.user} is not in the sudoers file.  This incident will be reported.`,
        code: 1,
      };
    }
    sudoUser = working.user;
    working.user = 'root';
    argv = rest;
  }

  const name = argv[0];
  const handler = COMMANDS[name];

  let result: CommandResult;
  if (!handler) {
    result = {
      state: working,
      stdout: '',
      stderr: `bash: ${name}: command not found`,
      code: 127,
    };
  } else {
    result = handler(working, argv, stdin);
  }

  working = result.state;
  if (sudoUser) working.user = sudoUser;
  if (assignments.length > 0 && argv.length > 0) working.env = savedEnv;

  return { ...result, state: working };
};

const applyRedirects = (
  result: CommandResult,
  command: SimpleCommand,
): CommandResult => {
  const { state } = result;
  let { stdout, stderr } = result;

  for (const redirect of command.redirects) {
    const path = resolvePath(state, redirect.path);
    const source = redirect.fd === 1 ? stdout : stderr;
    const previous = redirect.append ? (readFile(state.fs, path) ?? '') : '';
    const body =
      source === '' ? '' : source.endsWith('\n') ? source : `${source}\n`;

    if (!getDir(state.fs, dirname(path))) {
      return {
        state,
        stdout: '',
        stderr: `bash: ${redirect.path}: No such file or directory`,
        code: 1,
      };
    }
    writeFile(state.fs, path, previous + body, state.user);

    if (redirect.fd === 1) stdout = '';
    else stderr = '';
  }

  return { ...result, state, stdout, stderr };
};

export const runLine = (input: ShellState, line: string): RunResult => {
  const state: ShellState = structuredClone(input);
  const output: OutputLine[] = [];
  const trimmed = line.trim();

  if (trimmed === '') return { state, output, cleared: false };

  state.history.push(trimmed);

  const home = state.users[state.user]?.home ?? '/root';
  const parsed = parseLine(trimmed, state.env, home);
  if (!parsed.ok) {
    return {
      state,
      output: [{ text: parsed.error, stream: 'stderr' }],
      cleared: false,
    };
  }

  let working = state;
  let lastCode = 0;

  for (const segment of parsed.segments) {
    let stdin = '';
    let result: CommandResult = {
      state: working,
      stdout: '',
      stderr: '',
      code: 0,
    };

    for (const command of segment.commands) {
      result = applyRedirects(
        execSimple(result.state, command, stdin),
        command,
      );
      output.push(...toLines(result.stderr, 'stderr'));
      stdin = result.stdout;
      // Only the last stage of a pipeline reaches the screen.
      result = { ...result, stderr: '' };
    }

    output.push(...toLines(result.stdout, 'stdout'));
    working = result.state;
    lastCode = result.code;
    working.env['?'] = String(lastCode);

    if (segment.next === '&&' && lastCode !== 0) break;
    if (segment.next === '||' && lastCode === 0) break;
  }

  const cleared = working.clearScreen === true;
  delete working.clearScreen;

  return { state: working, output, cleared };
};

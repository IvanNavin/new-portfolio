'use client';

import { useCallback, useRef, useState } from 'react';

import type { TerminalTask } from '@/lib/content/types';
import { COMMANDS } from '@/lib/shell/commands';
import { getDir, isDir, resolvePath } from '@/lib/shell/fs';
import { runLine } from '@/lib/shell/run';
import type { ShellState } from '@/lib/shell/types';

export type ScrollbackLine = {
  id: number;
  text: string;
  stream: 'stdout' | 'stderr' | 'input' | 'system';
};

export const promptFor = (state: ShellState): string => {
  const home = state.users[state.user]?.home ?? '/root';
  const where =
    state.cwd === home
      ? '~'
      : state.cwd.startsWith(`${home}/`)
        ? `~${state.cwd.slice(home.length)}`
        : state.cwd;
  return `${state.user}@${state.hostname}:${where}${state.user === 'root' ? '#' : '$'}`;
};

/**
 * Everything the terminal shows lives in ONE state object updated by a pure
 * reducer. React's StrictMode invokes updater functions twice in development,
 * so an updater that also called setLines()/setFailures() echoed every command
 * twice — the fix is to have nothing to double.
 */
type TerminalState = {
  shell: ShellState;
  lines: ScrollbackLine[];
  failures: number;
  nextId: number;
};

export type TerminalApi = {
  state: ShellState;
  lines: ScrollbackLine[];
  prompt: string;
  submit: (line: string) => void;
  reset: () => void;
  /** How many commands have ended in an error message. */
  failures: number;
  recallOlder: (current: string) => string;
  recallNewer: (current: string) => string;
  complete: (current: string) => string;
};

const initial = (task: TerminalTask): TerminalState => ({
  shell: task.boot(),
  lines: (task.intro ?? []).map((text, index) => ({
    id: index,
    text,
    stream: 'system' as const,
  })),
  failures: 0,
  nextId: 1000,
});

const advance = (previous: TerminalState, raw: string): TerminalState => {
  const line = raw.replace(/\n/g, ' ');
  let id = previous.nextId;
  const echo: ScrollbackLine = {
    id: (id += 1),
    text: `${promptFor(previous.shell)} ${line}`,
    stream: 'input',
  };

  if (line.trim() === '') {
    return { ...previous, lines: [...previous.lines, echo], nextId: id };
  }

  const result = runLine(previous.shell, line);
  const produced: ScrollbackLine[] = result.output.map((output) => ({
    id: (id += 1),
    text: output.text,
    stream: output.stream === 'system' ? 'system' : output.stream,
  }));

  return {
    shell: result.state,
    lines: result.cleared ? [] : [...previous.lines, echo, ...produced],
    failures:
      previous.failures +
      (produced.some((output) => output.stream === 'stderr') ? 1 : 0),
    nextId: id,
  };
};

export const useTerminal = (task: TerminalTask): TerminalApi => {
  const [state, setState] = useState<TerminalState>(() => initial(task));
  const recallIndex = useRef<number | null>(null);

  const submit = useCallback((raw: string) => {
    recallIndex.current = null;
    setState((previous) => advance(previous, raw));
  }, []);

  const reset = useCallback(() => {
    recallIndex.current = null;
    setState(initial(task));
  }, [task]);

  const recallOlder = useCallback(
    (current: string) => {
      const entries = state.shell.history;
      if (entries.length === 0) return current;
      const index =
        recallIndex.current === null
          ? entries.length - 1
          : Math.max(0, recallIndex.current - 1);
      recallIndex.current = index;
      return entries[index];
    },
    [state.shell.history],
  );

  const recallNewer = useCallback(
    (current: string) => {
      const entries = state.shell.history;
      if (recallIndex.current === null) return current;
      const index = recallIndex.current + 1;
      if (index >= entries.length) {
        recallIndex.current = null;
        return '';
      }
      recallIndex.current = index;
      return entries[index];
    },
    [state.shell.history],
  );

  /**
   * Tab completion for command names and for paths under the cursor. It's a
   * real part of using a shell; without it the simulator feels like a text box.
   */
  const complete = useCallback(
    (current: string) => {
      const parts = current.split(' ');
      const word = parts[parts.length - 1];
      const isCommand = parts.length === 1;

      const candidates = isCommand
        ? Object.keys(COMMANDS).filter((name) => name.startsWith(word))
        : (() => {
            const slash = word.lastIndexOf('/');
            const dirPart = slash === -1 ? '.' : word.slice(0, slash) || '/';
            const namePart = slash === -1 ? word : word.slice(slash + 1);
            const dir = getDir(
              state.shell.fs,
              resolvePath(state.shell, dirPart),
            );
            if (!dir) return [];
            return Object.entries(dir.children)
              .filter(([name]) => name.startsWith(namePart))
              .map(([name, node]) => {
                const prefix = slash === -1 ? '' : word.slice(0, slash + 1);
                return `${prefix}${name}${isDir(node) ? '/' : ''}`;
              });
          })();

      if (candidates.length !== 1) return current;
      parts[parts.length - 1] = candidates[0];
      return parts.join(' ');
    },
    [state.shell],
  );

  return {
    state: state.shell,
    lines: state.lines,
    prompt: promptFor(state.shell),
    submit,
    reset,
    failures: state.failures,
    recallOlder,
    recallNewer,
    complete,
  };
};

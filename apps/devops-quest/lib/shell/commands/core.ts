import {
  basename,
  cloneNode,
  dirname,
  getDir,
  getNode,
  hasAccess,
  isDir,
  isFile,
  makeFile,
  mkdirp,
  modeToString,
  removeNode,
  resolvePath,
  walk,
  writeFile,
} from '../fs';
import {
  type Command,
  type CommandResult,
  fail,
  type FsNode,
  ok,
} from '../types';

/** Fixed clock: a simulator that drifts with the wall clock isn't reproducible. */
const STAMP = 'Mar 14 09:20';

const sizeOf = (node: FsNode): number =>
  node.type === 'file' ? node.content.length : 4096;

const flagsOf = (argv: string[]): Set<string> => {
  const flags = new Set<string>();
  for (const arg of argv.slice(1)) {
    if (arg.startsWith('--')) flags.add(arg.slice(2));
    else if (arg.startsWith('-') && arg.length > 1) {
      for (const ch of arg.slice(1)) flags.add(ch);
    }
  }
  return flags;
};

/** Positional args, with option values consumed by `takesValue`. */
const operandsOf = (argv: string[], takesValue: string[] = []): string[] => {
  const out: string[] = [];
  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('-') && arg.length > 1) {
      if (takesValue.includes(arg)) i += 1;
      continue;
    }
    out.push(arg);
  }
  return out;
};

const valueOf = (argv: string[], flag: string): string | null => {
  const index = argv.indexOf(flag);
  return index !== -1 && index + 1 < argv.length ? argv[index + 1] : null;
};

const pwd: Command = (state) => ok(state, state.cwd);

const cd: Command = (state, argv) => {
  const target = operandsOf(argv)[0] ?? '~';
  const path = resolvePath(state, target);
  const node = getNode(state.fs, path);
  if (!node)
    return fail(state, `bash: cd: ${target}: No such file or directory`);
  if (!isDir(node)) return fail(state, `bash: cd: ${target}: Not a directory`);
  if (!hasAccess(state, node, 'x')) {
    return fail(state, `bash: cd: ${target}: Permission denied`);
  }
  state.cwd = path;
  return ok(state);
};

const ls: Command = (state, argv) => {
  const flags = flagsOf(argv);
  const targets = operandsOf(argv);
  const paths = targets.length > 0 ? targets : ['.'];
  const chunks: string[] = [];

  for (const target of paths) {
    const path = resolvePath(state, target);
    const node = getNode(state.fs, path);
    if (!node) {
      return fail(
        state,
        `ls: cannot access '${target}': No such file or directory`,
      );
    }
    if (!isDir(node)) {
      chunks.push(flags.has('l') ? longLine(basename(path), node) : target);
      continue;
    }
    if (!hasAccess(state, node, 'r')) {
      return fail(
        state,
        `ls: cannot open directory '${target}': Permission denied`,
      );
    }

    let names = Object.keys(node.children).sort();
    if (flags.has('a')) names = ['.', '..', ...names];

    if (flags.has('l')) {
      const rows = names.map((name) => {
        const child =
          name === '.'
            ? node
            : name === '..'
              ? (getDir(state.fs, dirname(path)) ?? node)
              : node.children[name];
        return longLine(name, child);
      });
      const total = names.reduce(
        (sum, name) =>
          sum +
          (name === '.' || name === '..'
            ? 4
            : Math.ceil(sizeOf(node.children[name]) / 1024) || 4),
        0,
      );
      chunks.push([`total ${total}`, ...rows].join('\n'));
    } else {
      chunks.push(names.join(paths.length > 1 || flags.has('1') ? '\n' : '  '));
    }
  }

  return ok(state, chunks.filter(Boolean).join('\n'));
};

const longLine = (name: string, node: FsNode): string => {
  const links = node.type === 'dir' ? Object.keys(node.children).length + 2 : 1;
  return [
    modeToString(node),
    String(links).padStart(2),
    node.owner.padEnd(8),
    node.group.padEnd(8),
    String(sizeOf(node)).padStart(6),
    STAMP,
    name,
  ].join(' ');
};

const cat: Command = (state, argv, stdin) => {
  const targets = operandsOf(argv);
  if (targets.length === 0) return ok(state, stdin);
  const parts: string[] = [];
  for (const target of targets) {
    const path = resolvePath(state, target);
    const node = getNode(state.fs, path);
    if (!node) return fail(state, `cat: ${target}: No such file or directory`);
    if (isDir(node)) return fail(state, `cat: ${target}: Is a directory`);
    if (!hasAccess(state, node, 'r')) {
      return fail(state, `cat: ${target}: Permission denied`);
    }
    parts.push(node.content);
  }
  return ok(state, parts.join(''));
};

const echo: Command = (state, argv) => {
  const noNewline = argv[1] === '-n';
  const words = argv.slice(noNewline ? 2 : 1);
  const text = words.join(' ').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  return ok(state, noNewline ? text : `${text}\n`);
};

/**
 * `printf` is a bash builtin, so «command not found» was factually wrong — and
 * it is the natural reach for writing a multi-line file, which this box asks
 * for more than once. Format specifiers beyond %s are out of scope; escapes
 * are what people actually use it for here.
 */
const printf: Command = (state, argv) => {
  const args = argv.slice(1);
  if (args.length === 0) return fail(state, 'printf: usage: printf format');
  const [format, ...rest] = args;
  let index = 0;
  const text = format
    .replace(/%s/g, () => rest[index++] ?? '')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
  return ok(state, text);
};

const touch: Command = (state, argv) => {
  const targets = operandsOf(argv);
  if (targets.length === 0) return fail(state, 'touch: missing file operand');
  for (const target of targets) {
    const path = resolvePath(state, target);
    if (getNode(state.fs, path)) continue;
    const parent = getDir(state.fs, dirname(path));
    if (!parent) {
      return fail(
        state,
        `touch: cannot touch '${target}': No such file or directory`,
      );
    }
    if (!hasAccess(state, parent, 'w')) {
      return fail(state, `touch: cannot touch '${target}': Permission denied`);
    }
    parent.children[basename(path)] = makeFile(
      '',
      state.user,
      primaryGroup(state),
    );
  }
  return ok(state);
};

const primaryGroup = (state: {
  user: string;
  users: Record<string, { groups: string[] }>;
}): string => state.users[state.user]?.groups[0] ?? state.user;

const mkdir: Command = (state, argv) => {
  const flags = flagsOf(argv);
  const targets = operandsOf(argv);
  if (targets.length === 0) return fail(state, 'mkdir: missing operand');
  for (const target of targets) {
    const path = resolvePath(state, target);
    if (getNode(state.fs, path)) {
      if (flags.has('p')) continue;
      return fail(
        state,
        `mkdir: cannot create directory '${target}': File exists`,
      );
    }
    const parent = getDir(state.fs, dirname(path));
    if (!parent && !flags.has('p')) {
      return fail(
        state,
        `mkdir: cannot create directory '${target}': No such file or directory`,
      );
    }
    if (parent && !hasAccess(state, parent, 'w')) {
      return fail(
        state,
        `mkdir: cannot create directory '${target}': Permission denied`,
      );
    }
    mkdirp(state.fs, path, state.user, primaryGroup(state));
  }
  return ok(state);
};

const rm: Command = (state, argv) => {
  const flags = flagsOf(argv);
  const targets = operandsOf(argv);
  if (targets.length === 0 && !flags.has('f')) {
    return fail(state, 'rm: missing operand');
  }
  for (const target of targets) {
    const path = resolvePath(state, target);
    const node = getNode(state.fs, path);
    if (!node) {
      if (flags.has('f')) continue;
      return fail(
        state,
        `rm: cannot remove '${target}': No such file or directory`,
      );
    }
    if (
      isDir(node) &&
      !(flags.has('r') || flags.has('R') || flags.has('recursive'))
    ) {
      return fail(state, `rm: cannot remove '${target}': Is a directory`);
    }
    const parent = getDir(state.fs, dirname(path));
    if (parent && !hasAccess(state, parent, 'w')) {
      return fail(state, `rm: cannot remove '${target}': Permission denied`);
    }
    removeNode(state.fs, path);
  }
  return ok(state);
};

const copyOrMove =
  (move: boolean): Command =>
  (state, argv) => {
    const name = move ? 'mv' : 'cp';
    const flags = flagsOf(argv);
    const targets = operandsOf(argv);
    if (targets.length < 2)
      return fail(state, `${name}: missing destination file operand`);

    const sources = targets.slice(0, -1);
    const destRaw = targets[targets.length - 1];
    const destPath = resolvePath(state, destRaw);
    const destNode = getNode(state.fs, destPath);
    const intoDir = isDir(destNode);

    if (sources.length > 1 && !intoDir) {
      return fail(state, `${name}: target '${destRaw}' is not a directory`);
    }

    for (const source of sources) {
      const sourcePath = resolvePath(state, source);
      const node = getNode(state.fs, sourcePath);
      if (!node)
        return fail(
          state,
          `${name}: cannot stat '${source}': No such file or directory`,
        );
      if (isDir(node) && !move && !(flags.has('r') || flags.has('R'))) {
        return fail(
          state,
          `${name}: -r not specified; omitting directory '${source}'`,
        );
      }
      if (!hasAccess(state, node, 'r')) {
        return fail(
          state,
          `${name}: cannot open '${source}' for reading: Permission denied`,
        );
      }

      const finalPath = intoDir
        ? `${destPath}/${basename(sourcePath)}`
        : destPath;
      const parent = getDir(state.fs, dirname(finalPath));
      if (!parent) {
        return fail(
          state,
          `${name}: cannot create '${destRaw}': No such file or directory`,
        );
      }
      if (!hasAccess(state, parent, 'w')) {
        return fail(
          state,
          `${name}: cannot create '${destRaw}': Permission denied`,
        );
      }
      parent.children[basename(finalPath)] = cloneNode(node);
      if (move) removeNode(state.fs, sourcePath);
    }

    return ok(state);
  };

const find: Command = (state, argv) => {
  const root = resolvePath(
    state,
    argv[1] && !argv[1].startsWith('-') ? argv[1] : '.',
  );
  if (!getNode(state.fs, root)) {
    return fail(state, `find: '${argv[1]}': No such file or directory`);
  }
  const namePattern = valueOf(argv, '-name');
  const typeFilter = valueOf(argv, '-type');
  const permFilter = valueOf(argv, '-perm');

  const regex = namePattern
    ? new RegExp(
        `^${namePattern
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.')}$`,
      )
    : null;

  const matches = walk(state.fs, root).filter((path) => {
    const node = getNode(state.fs, path);
    if (!node) return false;
    if (regex && !regex.test(basename(path))) return false;
    if (typeFilter === 'f' && node.type !== 'file') return false;
    if (typeFilter === 'd' && node.type !== 'dir') return false;
    if (permFilter && (node.mode & 0o777) !== parseInt(permFilter, 8))
      return false;
    return true;
  });

  return ok(state, matches.join('\n'));
};

const grep: Command = (state, argv, stdin) => {
  const flags = flagsOf(argv);
  const operands = operandsOf(argv);
  const pattern = operands[0];
  if (pattern === undefined)
    return fail(state, 'usage: grep [OPTION]... PATTERN [FILE]...');

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags.has('i') ? 'i' : '');
  } catch {
    return fail(state, `grep: ${pattern}: invalid regular expression`);
  }

  const files = operands.slice(1);
  const recursive = flags.has('r') || flags.has('R');
  const sources: { label: string; content: string }[] = [];

  if (files.length === 0) {
    sources.push({ label: '', content: stdin });
  } else {
    for (const file of files) {
      const path = resolvePath(state, file);
      const node = getNode(state.fs, path);
      if (!node) return fail(state, `grep: ${file}: No such file or directory`);
      if (isDir(node)) {
        if (!recursive) {
          return fail(state, `grep: ${file}: Is a directory`);
        }
        for (const child of walk(state.fs, path)) {
          const childNode = getNode(state.fs, child);
          if (isFile(childNode) && hasAccess(state, childNode, 'r')) {
            sources.push({ label: child, content: childNode.content });
          }
        }
        continue;
      }
      if (!hasAccess(state, node, 'r'))
        return fail(state, `grep: ${file}: Permission denied`);
      sources.push({
        label: files.length > 1 || recursive ? file : '',
        content: node.content,
      });
    }
  }

  const out: string[] = [];
  let count = 0;
  for (const source of sources) {
    const lines = source.content.split('\n');
    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line === '') return;
      const hit = regex.test(line);
      if (hit === flags.has('v')) return;
      count += 1;
      const prefix = source.label ? `${source.label}:` : '';
      out.push(
        flags.has('n') ? `${prefix}${index + 1}:${line}` : `${prefix}${line}`,
      );
    });
  }

  if (flags.has('c')) return ok(state, String(count));
  return {
    state,
    stdout: out.join('\n'),
    stderr: '',
    code: out.length > 0 ? 0 : 1,
  };
};

const headOrTail =
  (isHead: boolean): Command =>
  (state, argv, stdin) => {
    const name = isHead ? 'head' : 'tail';
    const explicit = valueOf(argv, '-n');
    const shorthand = argv.slice(1).find((a) => /^-\d+$/.test(a));
    const count = Number(explicit ?? shorthand?.slice(1) ?? 10);
    const targets = operandsOf(argv, ['-n']);

    let content = stdin;
    if (targets.length > 0) {
      const path = resolvePath(state, targets[0]);
      const node = getNode(state.fs, path);
      if (!node)
        return fail(
          state,
          `${name}: cannot open '${targets[0]}' for reading: No such file or directory`,
        );
      if (isDir(node))
        return fail(
          state,
          `${name}: error reading '${targets[0]}': Is a directory`,
        );
      if (!hasAccess(state, node, 'r'))
        return fail(
          state,
          `${name}: cannot open '${targets[0]}' for reading: Permission denied`,
        );
      content = node.content;
    }

    const lines = content.replace(/\n$/, '').split('\n');
    const slice = isHead ? lines.slice(0, count) : lines.slice(-count);
    return ok(state, content === '' ? '' : slice.join('\n'));
  };

const wc: Command = (state, argv, stdin) => {
  const flags = flagsOf(argv);
  const targets = operandsOf(argv);
  let content = stdin;
  if (targets.length > 0) {
    const path = resolvePath(state, targets[0]);
    const node = getNode(state.fs, path);
    if (!node)
      return fail(state, `wc: ${targets[0]}: No such file or directory`);
    if (!isFile(node)) return fail(state, `wc: ${targets[0]}: Is a directory`);
    content = node.content;
  }
  const lines =
    content === '' ? 0 : content.replace(/\n$/, '').split('\n').length;
  const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
  const chars = content.length;

  const parts: string[] = [];
  if (flags.has('l')) parts.push(String(lines));
  if (flags.has('w')) parts.push(String(words));
  if (flags.has('c')) parts.push(String(chars));
  if (parts.length === 0)
    parts.push(String(lines), String(words), String(chars));
  return ok(state, `${parts.join(' ')}${targets[0] ? ` ${targets[0]}` : ''}`);
};

const sort: Command = (state, argv, stdin) => {
  const flags = flagsOf(argv);
  const targets = operandsOf(argv);
  let content = stdin;
  if (targets.length > 0) {
    const node = getNode(state.fs, resolvePath(state, targets[0]));
    if (!isFile(node)) return fail(state, `sort: cannot read: ${targets[0]}`);
    content = node.content;
  }
  const lines = content
    .replace(/\n$/, '')
    .split('\n')
    .filter((l) => l !== '');
  lines.sort((a, b) =>
    flags.has('n') ? Number(a) - Number(b) : a.localeCompare(b),
  );
  if (flags.has('r')) lines.reverse();
  return ok(state, lines.join('\n'));
};

const uniq: Command = (state, argv, stdin) => {
  const flags = flagsOf(argv);
  const lines = stdin.replace(/\n$/, '').split('\n');
  const out: string[] = [];
  let previous: string | null = null;
  let run = 0;
  const flush = () => {
    if (previous === null) return;
    out.push(
      flags.has('c') ? `${String(run).padStart(7)} ${previous}` : previous,
    );
  };
  for (const line of lines) {
    if (line === previous) {
      run += 1;
      continue;
    }
    flush();
    previous = line;
    run = 1;
  }
  flush();
  return ok(state, out.join('\n'));
};

const tee: Command = (state, argv, stdin) => {
  const flags = flagsOf(argv);
  for (const target of operandsOf(argv)) {
    const path = resolvePath(state, target);
    if (!getDir(state.fs, dirname(path))) {
      return fail(state, `tee: ${target}: No such file or directory`);
    }
    const existing = getNode(state.fs, path);
    if (existing && !hasAccess(state, existing, 'w')) {
      return fail(state, `tee: ${target}: Permission denied`);
    }
    const previous = flags.has('a')
      ? existing && isFile(existing)
        ? existing.content
        : ''
      : '';
    writeFile(
      state.fs,
      path,
      previous + stdin,
      state.user,
      primaryGroup(state),
    );
  }
  return ok(state, stdin);
};

const which: Command = (state, argv, _stdin) => {
  const target = argv[1];
  if (!target) return fail(state, 'usage: which command');
  // Resolved lazily against the registry by the caller in commands/index.
  return ok(state, `/usr/bin/${target}`);
};

const clear: Command = (state) => {
  state.clearScreen = true;
  return ok(state);
};

const date: Command = (state) => ok(state, 'Fri Mar 14 09:20:11 UTC 2031');

const hostnameCmd: Command = (state) => ok(state, state.hostname);

/** 1K blocks as `df -h` and `du -h` write them. */
const human = (kb: number): string => {
  if (kb === 0) return '0';
  if (kb >= 1024 * 1024) return `${(kb / 1024 / 1024).toFixed(1)}G`;
  if (kb >= 1024) return `${Math.round(kb / 1024)}M`;
  return `${kb}K`;
};

const hasFlag = (argv: string[], letter: string): boolean =>
  argv
    .slice(1)
    .some((word) => word.startsWith('-') && word.slice(1).includes(letter));

// `-h` used to be ignored: `df -h` printed 1K blocks and `du -sh` printed a
// bare number with no unit, on the one mission that is about reading disk
// usage. The numbers come from the machine so a mission can declare a disk
// that is actually full — «Диск заповнився» used to show 21% used.
const df: Command = (state, argv) => {
  const readable = hasFlag(argv, 'h');
  const { size, used } = state.disk;
  const rows: [string, number, number, string][] = [
    ['/dev/vda1', size, used, '/'],
    ['tmpfs', 2019104, 0, '/dev/shm'],
  ];
  const cell = (value: number): string =>
    readable ? human(value) : String(value);

  return ok(
    state,
    [
      readable
        ? `${'Filesystem'.padEnd(15)}${'Size'.padStart(5)}${'Used'.padStart(6)}${'Avail'.padStart(6)}${'Use%'.padStart(5)} Mounted on`
        : `${'Filesystem'.padEnd(15)}${'1K-blocks'.padStart(9)}${'Used'.padStart(8)}${'Available'.padStart(10)}${'Use%'.padStart(5)} Mounted on`,
      ...rows.map(([name, total, taken, mount]) => {
        const percent = total === 0 ? 0 : Math.round((taken / total) * 100);
        const widths = readable ? [5, 6, 6] : [9, 8, 10];
        return (
          name.padEnd(15) +
          cell(total).padStart(widths[0]) +
          cell(taken).padStart(widths[1]) +
          cell(total - taken).padStart(widths[2]) +
          `${percent}%`.padStart(5) +
          ` ${mount}`
        );
      }),
    ].join('\n'),
  );
};

const du: Command = (state, argv) => {
  const target = resolvePath(state, operandsOf(argv)[0] ?? '.');
  const paths = walk(state.fs, target);
  const total = paths.reduce((sum, path) => {
    const node = getNode(state.fs, path);
    return sum + (node ? Math.max(1, Math.ceil(sizeOf(node) / 1024)) : 0);
  }, 0);
  return ok(state, `${hasFlag(argv, 'h') ? human(total) : total}\t${target}`);
};

const env: Command = (state) =>
  ok(
    state,
    Object.entries(state.env)
      .filter(([key]) => key !== '?')
      .map(([key, value]) => `${key}=${value}`)
      .join('\n'),
  );

const exportCmd: Command = (state, argv) => {
  for (const arg of argv.slice(1)) {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/s.exec(arg);
    if (match) state.env[match[1]] = match[2];
  }
  return ok(state);
};

const printenv: Command = (state, argv) => {
  const name = argv[1];
  if (!name) return env(state, ['env'], '');
  const value = state.env[name];
  return value === undefined
    ? { state, stdout: '', stderr: '', code: 1 }
    : ok(state, value);
};

const historyCmd: Command = (state) =>
  ok(
    state,
    state.history
      .map((line, index) => `${String(index + 1).padStart(5)}  ${line}`)
      .join('\n'),
  );

const truncateOut = (result: CommandResult): CommandResult => result;

export const CORE_COMMANDS: Record<string, Command> = {
  pwd,
  cd,
  ls,
  cat,
  echo,
  printf,
  touch,
  mkdir,
  rm,
  rmdir: rm,
  cp: copyOrMove(false),
  mv: copyOrMove(true),
  find,
  grep,
  egrep: grep,
  head: headOrTail(true),
  tail: headOrTail(false),
  wc,
  sort,
  uniq,
  tee,
  which,
  clear,
  date,
  hostname: hostnameCmd,
  df,
  du,
  env,
  export: exportCmd,
  printenv,
  history: historyCmd,
  less: (state, argv, stdin) => truncateOut(cat(state, argv, stdin)),
  more: (state, argv, stdin) => truncateOut(cat(state, argv, stdin)),
};

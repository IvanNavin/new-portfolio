import {
  getNode,
  isFile,
  mkdirp,
  readFile,
  removeNode,
  resolvePath,
  walk,
  writeFile,
} from '../fs';
import {
  type Command,
  fail,
  type GitCommit,
  type GitTree,
  ok,
  type ShellState,
} from '../types';

/**
 * Git is modelled as real snapshots — the index and every commit hold a full
 * `path -> content` tree — rather than a list of "changed files". That is what
 * makes `git status` honest, lets `checkout` actually swap the working tree,
 * and lets `merge` produce a genuine conflict with markers in the file.
 */

const shortHash = (state: ShellState, message: string): string => {
  let hash = 0x811c9dc5;
  const seed = `${state.git.commits.length}:${message}:${state.git.branch}`;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0').slice(0, 7);
};

const rel = (state: ShellState, absolute: string): string =>
  absolute.startsWith(`${state.git.root}/`)
    ? absolute.slice(state.git.root.length + 1)
    : absolute === state.git.root
      ? ''
      : absolute;

const ignorePatterns = (state: ShellState): RegExp[] =>
  (readFile(state.fs, `${state.git.root}/.gitignore`) ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
    .map(
      (line) =>
        new RegExp(
          `^${line
            .replace(/\/$/, '(/.*)?')
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '[^/]*')}$`,
        ),
    );

const isIgnored = (patterns: RegExp[], path: string): boolean =>
  patterns.some(
    (pattern) =>
      pattern.test(path) || path.split('/').some((part) => pattern.test(part)),
  );

/** The working tree as git sees it, minus .git and anything in .gitignore. */
const workingTree = (state: ShellState): GitTree => {
  const patterns = ignorePatterns(state);
  const tree: GitTree = {};
  for (const path of walk(state.fs, state.git.root)) {
    const node = getNode(state.fs, path);
    if (!isFile(node)) continue;
    const relative = rel(state, path);
    if (relative === '' || relative.startsWith('.git/')) continue;
    if (isIgnored(patterns, relative)) continue;
    tree[relative] = node.content;
  }
  return tree;
};

const headTree = (state: ShellState): GitTree => {
  const head = state.git.branches[state.git.branch];
  const commit = state.git.commits.find((each) => each.hash === head);
  return commit ? commit.tree : {};
};

const commitOf = (state: ShellState, hash: string): GitCommit | undefined =>
  state.git.commits.find((each) => each.hash === hash);

/** Every ancestor hash of `hash`, nearest first. */
const ancestry = (state: ShellState, hash: string | undefined): string[] => {
  const out: string[] = [];
  const queue = hash ? [hash] : [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || out.includes(current)) continue;
    out.push(current);
    const commit = commitOf(state, current);
    if (commit) queue.push(...commit.parents);
  }
  return out;
};

const mergeBase = (
  state: ShellState,
  a: string,
  b: string,
): GitCommit | undefined => {
  const ancestorsOfB = ancestry(state, b);
  for (const hash of ancestry(state, a)) {
    if (ancestorsOfB.includes(hash)) return commitOf(state, hash);
  }
  return undefined;
};

const notARepo = (state: ShellState) =>
  fail(
    state,
    'fatal: not a git repository (or any of the parent directories): .git',
    128,
  );

const applyTree = (state: ShellState, tree: GitTree): void => {
  for (const path of Object.keys(workingTree(state))) {
    if (!(path in tree)) removeNode(state.fs, `${state.git.root}/${path}`);
  }
  for (const [path, content] of Object.entries(tree)) {
    writeFile(
      state.fs,
      `${state.git.root}/${path}`,
      content,
      state.user,
      state.user,
    );
  }
};

const init: Command = (state, argv) => {
  const target = resolvePath(
    state,
    argv.slice(1).find((a) => !a.startsWith('-')) ?? '.',
  );
  mkdirp(state.fs, `${target}/.git`, state.user, state.user);
  state.git = {
    ...state.git,
    initialized: true,
    root: target,
    branch: 'main',
    branches: {},
    commits: [],
    index: {},
  };
  return ok(state, `Initialized empty Git repository in ${target}/.git/`);
};

const config: Command = (state, argv) => {
  const args = argv.slice(1).filter((a) => !a.startsWith('--'));
  const [key, value] = args;
  if (key === 'user.name' && value) state.git.userName = value;
  if (key === 'user.email' && value) state.git.userEmail = value;
  if (!value) {
    const current =
      key === 'user.name' ? state.git.userName : state.git.userEmail;
    return current
      ? ok(state, current)
      : { state, stdout: '', stderr: '', code: 1 };
  }
  return ok(state);
};

const status: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const working = workingTree(state);
  const head = headTree(state);
  const { index } = state.git;
  const short = argv.includes('-s') || argv.includes('--short');

  const staged = Object.keys(index).filter(
    (path) => index[path] !== head[path],
  );
  const deletedStaged = Object.keys(head).filter((path) => !(path in index));
  const modified = Object.keys(working).filter(
    (path) => path in index && working[path] !== index[path],
  );
  const untracked = Object.keys(working).filter(
    (path) => !(path in index) && !(path in head),
  );

  if (short) {
    return ok(
      state,
      [
        ...staged.map((path) => `${path in head ? 'M ' : 'A '} ${path}`),
        ...modified.map((path) => ` M ${path}`),
        ...untracked.map((path) => `?? ${path}`),
      ].join('\n'),
    );
  }

  const lines = [`On branch ${state.git.branch}`];

  if (state.git.conflicts.length > 0) {
    lines.push(
      `You have unmerged paths.`,
      '  (fix conflicts and run "git commit")',
      '',
      'Unmerged paths:',
      ...state.git.conflicts.map((path) => `\tboth modified:   ${path}`),
      '',
    );
  }

  if (state.git.commits.length === 0) {
    lines.push('', 'No commits yet');
  }

  if (staged.length > 0 || deletedStaged.length > 0) {
    lines.push(
      '',
      'Changes to be committed:',
      '  (use "git restore --staged <file>..." to unstage)',
      ...staged.map(
        (path) => `\t${path in head ? 'modified:' : 'new file:'}   ${path}`,
      ),
      ...deletedStaged.map((path) => `\tdeleted:    ${path}`),
    );
  }

  if (modified.length > 0) {
    lines.push(
      '',
      'Changes not staged for commit:',
      '  (use "git add <file>..." to update what will be committed)',
      ...modified.map((path) => `\tmodified:   ${path}`),
    );
  }

  if (untracked.length > 0) {
    lines.push(
      '',
      'Untracked files:',
      '  (use "git add <file>..." to include in what will be committed)',
      ...untracked.map((path) => `\t${path}`),
    );
  }

  if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
    lines.push('', 'nothing to commit, working tree clean');
  }

  return ok(state, lines.join('\n'));
};

const add: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const targets = argv.slice(1).filter((a) => !a.startsWith('-'));
  if (targets.length === 0) {
    return fail(
      state,
      "Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?",
    );
  }

  const working = workingTree(state);
  for (const target of targets) {
    if (target === '.' || target === '-A' || target === '*') {
      state.git.index = { ...working };
      continue;
    }
    const relative = rel(state, resolvePath(state, target));
    const matches = Object.keys(working).filter(
      (path) => path === relative || path.startsWith(`${relative}/`),
    );
    if (matches.length === 0) {
      return fail(
        state,
        `fatal: pathspec '${target}' did not match any files`,
        128,
      );
    }
    for (const path of matches) state.git.index[path] = working[path];
  }

  // Staging a conflicted file is how you tell git you resolved it.
  state.git.conflicts = state.git.conflicts.filter((path) => {
    const content = working[path] ?? '';
    return content.includes('<<<<<<<') && !(path in state.git.index);
  });

  return ok(state);
};

const commit: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);

  const messageIndex = argv.findIndex((a) => a === '-m' || a === '--message');
  const message = messageIndex !== -1 ? argv[messageIndex + 1] : null;
  if (!message) {
    return fail(state, 'Aborting commit due to empty commit message.', 1);
  }

  if (argv.includes('-a') || argv.includes('-am')) {
    const working = workingTree(state);
    for (const path of Object.keys(state.git.index)) {
      if (path in working) state.git.index[path] = working[path];
    }
  }

  const unresolved = state.git.conflicts.filter((path) =>
    (state.git.index[path] ?? '').includes('<<<<<<<'),
  );
  if (unresolved.length > 0) {
    return fail(
      state,
      [
        'error: Committing is not possible because you have unmerged files.',
        ...unresolved.map((p) => `\t${p}`),
      ].join('\n'),
      1,
    );
  }

  const head = headTree(state);
  const changed = Object.keys({ ...head, ...state.git.index }).filter(
    (path) => head[path] !== state.git.index[path],
  );
  if (changed.length === 0 && !state.git.merging) {
    return fail(
      state,
      `On branch ${state.git.branch}\nnothing to commit, working tree clean`,
      1,
    );
  }

  const parents = [state.git.branches[state.git.branch]].filter(
    Boolean,
  ) as string[];
  if (state.git.merging && state.git.branches[state.git.merging]) {
    parents.push(state.git.branches[state.git.merging]);
  }

  const hash = shortHash(state, message);
  state.git.commits.push({
    hash,
    message,
    parents,
    author: state.git.userName ?? state.user,
    tree: { ...state.git.index },
  });
  state.git.branches[state.git.branch] = hash;
  const wasMerging = state.git.merging;
  state.git.merging = null;
  state.git.conflicts = [];

  return ok(
    state,
    [
      `[${state.git.branch} ${hash}] ${message}`,
      wasMerging
        ? ''
        : ` ${changed.length} file${changed.length === 1 ? '' : 's'} changed`,
    ]
      .filter(Boolean)
      .join('\n'),
  );
};

const log: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const chain = ancestry(state, state.git.branches[state.git.branch])
    .map((hash) => commitOf(state, hash))
    .filter((each): each is GitCommit => each !== undefined);

  if (chain.length === 0) {
    return fail(
      state,
      `fatal: your current branch '${state.git.branch}' does not have any commits yet`,
      128,
    );
  }

  if (argv.includes('--oneline')) {
    return ok(
      state,
      chain.map((each) => `${each.hash} ${each.message}`).join('\n'),
    );
  }

  return ok(
    state,
    chain
      .map((each) =>
        [
          `commit ${each.hash}${each.parents.length > 1 ? ' (merge)' : ''}`,
          `Author: ${each.author} <${state.git.userEmail ?? `${each.author}@example.com`}>`,
          'Date:   Fri Mar 14 09:20:11 2031 +0000',
          '',
          `    ${each.message}`,
          '',
        ].join('\n'),
      )
      .join('\n'),
  );
};

const branch: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const args = argv.slice(1);
  const deleteIndex = args.findIndex((a) => a === '-d' || a === '-D');
  if (deleteIndex !== -1) {
    const name = args[deleteIndex + 1];
    if (!state.git.branches[name])
      return fail(state, `error: branch '${name}' not found.`, 1);
    delete state.git.branches[name];
    return ok(state, `Deleted branch ${name}.`);
  }

  const name = args.find((a) => !a.startsWith('-'));
  if (!name) {
    const names = Object.keys(state.git.branches);
    if (names.length === 0) names.push(state.git.branch);
    return ok(
      state,
      names
        .sort()
        .map((each) => (each === state.git.branch ? `* ${each}` : `  ${each}`))
        .join('\n'),
    );
  }

  if (state.git.branches[name]) {
    return fail(state, `fatal: a branch named '${name}' already exists`, 128);
  }
  const head = state.git.branches[state.git.branch];
  if (head) state.git.branches[name] = head;
  return ok(state);
};

const checkout: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const args = argv.slice(1);
  const create = args.includes('-b') || args.includes('-c');
  const name = args.find((a) => !a.startsWith('-'));
  if (!name) return fail(state, 'fatal: you must specify a branch name', 128);

  if (create) {
    if (state.git.branches[name]) {
      return fail(state, `fatal: a branch named '${name}' already exists`, 128);
    }
    const head = state.git.branches[state.git.branch];
    if (head) state.git.branches[name] = head;
    state.git.branch = name;
    return ok(state, `Switched to a new branch '${name}'`);
  }

  if (!state.git.branches[name]) {
    return fail(
      state,
      `error: pathspec '${name}' did not match any file(s) known to git`,
      1,
    );
  }

  state.git.branch = name;
  const commit = commitOf(state, state.git.branches[name]);
  const tree = commit ? commit.tree : {};
  applyTree(state, tree);
  state.git.index = { ...tree };
  return ok(state, `Switched to branch '${name}'`);
};

const merge: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const name = argv.slice(1).find((a) => !a.startsWith('-'));
  if (!name)
    return fail(
      state,
      'fatal: No commit specified and merge.defaultToUpstream not set',
      128,
    );
  if (!state.git.branches[name])
    return fail(state, `merge: ${name} - not something we can merge`, 1);

  const ourHash = state.git.branches[state.git.branch];
  const theirHash = state.git.branches[name];
  if (ourHash === theirHash) return ok(state, 'Already up to date.');

  const base = mergeBase(state, ourHash, theirHash);
  const ours = headTree(state);
  const theirs = commitOf(state, theirHash)?.tree ?? {};
  const baseTree = base?.tree ?? {};

  // Fast-forward: our head is an ancestor of theirs.
  if (
    ourHash &&
    ancestry(state, theirHash).includes(ourHash) &&
    base?.hash === ourHash
  ) {
    state.git.branches[state.git.branch] = theirHash;
    applyTree(state, theirs);
    state.git.index = { ...theirs };
    return ok(state, `Updating ${ourHash}..${theirHash}\nFast-forward`);
  }

  const merged: GitTree = { ...ours };
  const conflicts: string[] = [];

  for (const path of new Set([...Object.keys(ours), ...Object.keys(theirs)])) {
    const oursContent = ours[path];
    const theirsContent = theirs[path];
    const baseContent = baseTree[path];

    if (oursContent === theirsContent) continue;
    if (oursContent === baseContent) {
      if (theirsContent === undefined) delete merged[path];
      else merged[path] = theirsContent;
      continue;
    }
    if (theirsContent === baseContent) continue;

    conflicts.push(path);
    merged[path] = [
      '<<<<<<< HEAD',
      (oursContent ?? '').replace(/\n$/, ''),
      '=======',
      (theirsContent ?? '').replace(/\n$/, ''),
      `>>>>>>> ${name}`,
      '',
    ].join('\n');
  }

  applyTree(state, merged);

  if (conflicts.length > 0) {
    state.git.merging = name;
    state.git.conflicts = conflicts;
    state.git.index = { ...ours };
    return fail(
      state,
      [
        ...conflicts.map(
          (path) =>
            `Auto-merging ${path}\nCONFLICT (content): Merge conflict in ${path}`,
        ),
        'Automatic merge failed; fix conflicts and then commit the result.',
      ].join('\n'),
      1,
    );
  }

  state.git.index = { ...merged };
  state.git.merging = name;
  return commit(state, ['commit', '-m', `Merge branch '${name}'`], '');
};

const remote: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const action = argv[1];
  if (!action || action === '-v' || action === 'show') {
    return ok(
      state,
      Object.entries(state.git.remotes)
        .flatMap(([name, url]) => [
          `${name}\t${url} (fetch)`,
          `${name}\t${url} (push)`,
        ])
        .join('\n'),
    );
  }
  if (action === 'add') {
    const [, , name, url] = argv;
    if (!name || !url)
      return fail(state, 'usage: git remote add <name> <url>', 129);
    if (state.git.remotes[name])
      return fail(state, `error: remote ${name} already exists.`, 3);
    state.git.remotes[name] = url;
    return ok(state);
  }
  if (action === 'remove' || action === 'rm') {
    delete state.git.remotes[argv[2]];
    return ok(state);
  }
  return fail(state, `error: Unknown subcommand: ${action}`, 1);
};

const push: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const args = argv.slice(1).filter((a) => !a.startsWith('-'));
  const remoteName = args[0] ?? 'origin';
  const branchName = args[1] ?? state.git.branch;

  if (!state.git.remotes[remoteName]) {
    return fail(
      state,
      `fatal: '${remoteName}' does not appear to be a git repository\nfatal: Could not read from remote repository.`,
      128,
    );
  }
  const head = state.git.branches[branchName];
  if (!head)
    return fail(
      state,
      `error: src refspec ${branchName} does not match any`,
      1,
    );
  if (state.git.pushed[branchName] === head)
    return ok(state, 'Everything up-to-date');

  state.git.pushed[branchName] = head;
  return ok(
    state,
    [
      `Enumerating objects: ${state.git.commits.length * 3}, done.`,
      `To ${state.git.remotes[remoteName]}`,
      `   ${head}..${head}  ${branchName} -> ${branchName}`,
    ].join('\n'),
  );
};

const tag: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const args = argv.slice(1);
  const name = args.find(
    (a, index) => !a.startsWith('-') && args[index - 1] !== '-m',
  );
  if (!name) return ok(state, Object.keys(state.git.tags).sort().join('\n'));
  const head = state.git.branches[state.git.branch];
  if (!head)
    return fail(state, `fatal: Failed to resolve 'HEAD' as a valid ref.`, 128);
  state.git.tags[name] = head;
  return ok(state);
};

const diff: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const staged = argv.includes('--staged') || argv.includes('--cached');
  const left = staged ? headTree(state) : state.git.index;
  const right = staged ? state.git.index : workingTree(state);

  const out: string[] = [];
  for (const path of new Set([...Object.keys(left), ...Object.keys(right)])) {
    if (left[path] === right[path]) continue;
    out.push(
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
    );
    const before = (left[path] ?? '').split('\n');
    const after = (right[path] ?? '').split('\n');
    for (const line of before)
      if (!after.includes(line) && line !== '') out.push(`-${line}`);
    for (const line of after)
      if (!before.includes(line) && line !== '') out.push(`+${line}`);
  }
  return ok(state, out.join('\n'));
};

const revert: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const target = argv.slice(1).find((a) => !a.startsWith('-'));
  const head = state.git.branches[state.git.branch];
  const resolved =
    !target || target === 'HEAD'
      ? head
      : target === 'HEAD~1' || target === 'HEAD^'
        ? (commitOf(state, head)?.parents[0] ?? '')
        : target;
  const victim = commitOf(state, resolved);
  if (!victim) return fail(state, `fatal: bad revision '${target}'`, 128);

  const parent = victim.parents[0]
    ? commitOf(state, victim.parents[0])
    : undefined;
  const restored = parent ? parent.tree : {};
  applyTree(state, restored);
  state.git.index = { ...restored };
  return commit(state, ['commit', '-m', `Revert "${victim.message}"`], '');
};

const reset: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const hard = argv.includes('--hard');
  const target = argv.slice(1).find((a) => !a.startsWith('-'));
  const head = state.git.branches[state.git.branch];

  // Bare `git reset` just unstages; it never moves the branch pointer.
  if (!target) {
    state.git.index = { ...headTree(state) };
    return ok(state, 'Unstaged changes after reset');
  }

  const resolved =
    target === 'HEAD~1' || target === 'HEAD^'
      ? commitOf(state, head)?.parents[0]
      : target === 'HEAD'
        ? head
        : (commitOf(state, target)?.hash ?? state.git.branches[target]);

  if (!resolved || !commitOf(state, resolved)) {
    return fail(
      state,
      `fatal: ambiguous argument '${target}': unknown revision`,
      128,
    );
  }

  state.git.branches[state.git.branch] = resolved;
  const tree = commitOf(state, resolved)?.tree ?? {};
  state.git.index = { ...tree };
  // --hard also throws away the working tree; that's what makes it dangerous.
  if (hard) applyTree(state, tree);
  return ok(
    state,
    `HEAD is now at ${resolved} ${commitOf(state, resolved)?.message ?? ''}`,
  );
};

const restore: Command = (state, argv) => {
  if (!state.git.initialized) return notARepo(state);
  const unstage = argv.includes('--staged');
  const targets = argv.slice(1).filter((a) => !a.startsWith('-'));
  const head = headTree(state);

  for (const target of targets) {
    const relative = rel(state, resolvePath(state, target));
    if (unstage) {
      if (relative in head) state.git.index[relative] = head[relative];
      else delete state.git.index[relative];
    } else if (relative in state.git.index) {
      writeFile(
        state.fs,
        `${state.git.root}/${relative}`,
        state.git.index[relative],
        state.user,
        state.user,
      );
    }
  }
  return ok(state);
};

const SUBCOMMANDS: Record<string, Command> = {
  init,
  config,
  status,
  add,
  commit,
  log,
  branch,
  checkout,
  switch: checkout,
  merge,
  remote,
  push,
  pull: push,
  tag,
  diff,
  revert,
  reset,
  restore,
};

const git: Command = (state, argv, stdin) => {
  const sub = argv[1];
  if (!sub) {
    return fail(
      state,
      [
        'usage: git <command> [<args>]',
        '',
        `Доступні тут: ${Object.keys(SUBCOMMANDS).sort().join(', ')}`,
      ].join('\n'),
      1,
    );
  }
  const handler = SUBCOMMANDS[sub];
  if (!handler) {
    return fail(
      state,
      `git: '${sub}' is not a git command. See 'git --help'.`,
      1,
    );
  }
  return handler(state, argv.slice(1), stdin);
};

export const GIT_COMMANDS: Record<string, Command> = { git };

import type { DirNode, FileNode, FsNode, ShellState } from './types';

/* ------------------------------------------------------------------ paths */

/** Split a path into segments, dropping empties and resolving `.` / `..`. */
export const splitPath = (path: string): string[] => {
  const out: string[] = [];
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out;
};

/** Turn any user-typed path into an absolute, normalised one. */
export const resolvePath = (state: ShellState, raw: string): string => {
  let path = raw;
  if (path === '~' || path.startsWith('~/')) {
    const home = state.users[state.user]?.home ?? '/root';
    path = home + path.slice(1);
  }
  const absolute = path.startsWith('/') ? path : `${state.cwd}/${path}`;
  const parts = splitPath(absolute);
  return `/${parts.join('/')}`;
};

export const basename = (path: string): string => splitPath(path).pop() ?? '/';

export const dirname = (path: string): string => {
  const parts = splitPath(path);
  parts.pop();
  return `/${parts.join('/')}`;
};

/* ------------------------------------------------------------------ nodes */

export const isDir = (node: FsNode | null): node is DirNode =>
  node?.type === 'dir';

export const isFile = (node: FsNode | null): node is FileNode =>
  node?.type === 'file';

/** Walk to a node by absolute path. Returns null if any segment is missing. */
export const getNode = (root: DirNode, path: string): FsNode | null => {
  let node: FsNode = root;
  for (const part of splitPath(path)) {
    if (!isDir(node)) return null;
    const next: FsNode | undefined = node.children[part];
    if (!next) return null;
    node = next;
  }
  return node;
};

export const getDir = (root: DirNode, path: string): DirNode | null => {
  const node = getNode(root, path);
  return isDir(node) ? node : null;
};

export const exists = (root: DirNode, path: string): boolean =>
  getNode(root, path) !== null;

export const readFile = (root: DirNode, path: string): string | null => {
  const node = getNode(root, path);
  return isFile(node) ? node.content : null;
};

export const makeDir = (
  owner: string,
  group = owner,
  mode = 0o755,
): DirNode => ({ type: 'dir', mode, owner, group, children: {} });

export const makeFile = (
  content: string,
  owner: string,
  group = owner,
  mode = 0o644,
): FileNode => ({ type: 'file', content, mode, owner, group });

/** mkdir -p. Returns false only if a path segment exists as a file. */
export const mkdirp = (
  root: DirNode,
  path: string,
  owner: string,
  group = owner,
  mode = 0o755,
): boolean => {
  let node: DirNode = root;
  for (const part of splitPath(path)) {
    const next = node.children[part];
    if (next) {
      if (!isDir(next)) return false;
      node = next;
    } else {
      const created = makeDir(owner, group, mode);
      node.children[part] = created;
      node = created;
    }
  }
  return true;
};

/** Write a file, creating parent dirs. Preserves mode/owner if it existed. */
export const writeFile = (
  root: DirNode,
  path: string,
  content: string,
  owner: string,
  group = owner,
): boolean => {
  const parentPath = dirname(path);
  if (!mkdirp(root, parentPath, owner, group)) return false;
  const parent = getDir(root, parentPath);
  if (!parent) return false;
  const name = basename(path);
  const current = parent.children[name];
  if (current && !isFile(current)) return false;
  parent.children[name] = current
    ? { ...current, content }
    : makeFile(content, owner, group);
  return true;
};

export const removeNode = (root: DirNode, path: string): boolean => {
  const parent = getDir(root, dirname(path));
  const name = basename(path);
  if (!parent || !parent.children[name]) return false;
  delete parent.children[name];
  return true;
};

/** Deep copy so `cp -r` can't alias the source tree. */
export const cloneNode = (node: FsNode): FsNode =>
  node.type === 'file'
    ? { ...node }
    : {
        ...node,
        children: Object.fromEntries(
          Object.entries(node.children).map(([k, v]) => [k, cloneNode(v)]),
        ),
      };

/** Every absolute path under `path`, depth-first, including `path` itself. */
export const walk = (root: DirNode, path: string): string[] => {
  const node = getNode(root, path);
  if (!node) return [];
  if (!isDir(node)) return [path];
  const out = [path];
  for (const name of Object.keys(node.children).sort()) {
    out.push(...walk(root, `${path === '/' ? '' : path}/${name}`));
  }
  return out;
};

/* ------------------------------------------------------------------ modes */

const RWX = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];

/** 0o644 -> "-rw-r--r--" */
export const modeToString = (node: FsNode): string => {
  const type = node.type === 'dir' ? 'd' : '-';
  const m = node.mode;
  let other = RWX[m & 7];
  // Sticky bit: /tmp is 1777 and really does render as drwxrwxrwt.
  if (m & 0o1000) other = other.slice(0, 2) + (other[2] === 'x' ? 't' : 'T');
  return type + RWX[(m >> 6) & 7] + RWX[(m >> 3) & 7] + other;
};

export const modeToOctal = (mode: number): string =>
  mode.toString(8).padStart(3, '0');

/**
 * Parse a chmod spec: octal ("755", "0644") or symbolic ("u+x", "go-w",
 * "a=r", "u=rw,go=r"). Returns null when the spec is nonsense, so callers can
 * emit the real `chmod: invalid mode: 'x'` message.
 */
export const parseMode = (spec: string, current: number): number | null => {
  if (/^[0-7]{3,4}$/.test(spec)) return parseInt(spec, 8) & 0o7777;

  let mode = current;
  for (const clause of spec.split(',')) {
    const match = /^([ugoa]*)([+\-=])([rwxX]*)$/.exec(clause);
    if (!match) return null;
    const [, whoRaw, op, permsRaw] = match;
    const who = whoRaw === '' || whoRaw === 'a' ? 'ugo' : whoRaw;

    let bits = 0;
    if (permsRaw.includes('r')) bits |= 4;
    if (permsRaw.includes('w')) bits |= 2;
    if (permsRaw.includes('x') || permsRaw.includes('X')) bits |= 1;

    for (const target of new Set(who)) {
      const shift = target === 'u' ? 6 : target === 'g' ? 3 : 0;
      if (op === '+') mode |= bits << shift;
      else if (op === '-') mode &= ~(bits << shift);
      else mode = (mode & ~(7 << shift)) | (bits << shift);
    }
  }
  return mode;
};

/* ------------------------------------------------------ permission checks */

type Access = 'r' | 'w' | 'x';

const BIT: Record<Access, number> = { r: 4, w: 2, x: 1 };

/** Does `user` hold `access` on `node`? root always does. */
export const hasAccess = (
  state: ShellState,
  node: FsNode,
  access: Access,
): boolean => {
  if (state.user === 'root') return true;
  const account = state.users[state.user];
  const inGroup =
    account?.groups.includes(node.group) || account?.name === node.group;
  const shift = node.owner === state.user ? 6 : inGroup ? 3 : 0;
  return ((node.mode >> shift) & BIT[access]) !== 0;
};

/**
 * Walking to `path` requires +x on every directory along the way. This is what
 * makes `chmod 700 ~/.ssh` actually mean something in the SSH missions.
 */
export const canTraverse = (state: ShellState, path: string): boolean => {
  let node: FsNode = state.fs;
  if (!hasAccess(state, node, 'x')) return false;
  for (const part of splitPath(path)) {
    if (!isDir(node)) return false;
    const next: FsNode | undefined = node.children[part];
    if (!next) return true; // missing leaf is a different error
    node = next;
    if (isDir(node) && !hasAccess(state, node, 'x')) return false;
  }
  return true;
};

import {
  getNode,
  hasAccess,
  isDir,
  parseMode,
  resolvePath,
  walk,
  writeFile,
} from '../fs';
import { type Command, fail, ok, type ShellState } from '../types';

/**
 * Keep /etc/passwd and /etc/group honest after every account change, so
 * `cat /etc/passwd` shows what `useradd` actually did instead of a static
 * prop file. This is the whole point of level 2.
 */
export const syncAccountFiles = (state: ShellState): void => {
  const passwd = Object.values(state.users)
    .sort((a, b) => a.uid - b.uid)
    .map((u) => `${u.name}:x:${u.uid}:${u.gid}:${u.name}:${u.home}:${u.shell}`)
    .join('\n');

  const group = Object.values(state.groups)
    .sort((a, b) => a.gid - b.gid)
    .map((g) => `${g.name}:x:${g.gid}:${g.members.join(',')}`)
    .join('\n');

  writeFile(state.fs, '/etc/passwd', `${passwd}\n`, 'root', 'root');
  writeFile(state.fs, '/etc/group', `${group}\n`, 'root', 'root');
};

const nextId = (taken: number[], from = 1000): number => {
  let id = from;
  while (taken.includes(id)) id += 1;
  return id;
};

const requireRoot = (state: ShellState, name: string): string | null =>
  state.user === 'root'
    ? null
    : `${name}: Permission denied (you must be root — try sudo)`;

const whoami: Command = (state) => ok(state, state.user);

const id: Command = (state, argv) => {
  const name = argv.find((a, i) => i > 0 && !a.startsWith('-')) ?? state.user;
  const account = state.users[name];
  if (!account) return fail(state, `id: '${name}': no such user`);
  const groupList = account.groups
    .map((g) => `${state.groups[g]?.gid ?? 0}(${g})`)
    .join(',');
  const primary = Object.values(state.groups).find(
    (g) => g.gid === account.gid,
  );
  return ok(
    state,
    `uid=${account.uid}(${account.name}) gid=${account.gid}(${primary?.name ?? account.name}) groups=${groupList}`,
  );
};

const groupsCmd: Command = (state, argv) => {
  const name = argv[1] ?? state.user;
  const account = state.users[name];
  if (!account) return fail(state, `groups: '${name}': no such user`);
  return ok(state, account.groups.join(' '));
};

const useradd: Command = (state, argv) => {
  const denied = requireRoot(state, 'useradd');
  if (denied) return fail(state, denied);

  const args = argv.slice(1);
  const name = args.filter((a) => !a.startsWith('-')).pop();
  if (!name) return fail(state, 'useradd: missing operand');
  if (state.users[name])
    return fail(state, `useradd: user '${name}' already exists`, 9);

  const wantsHome = args.includes('-m') || args.includes('--create-home');
  const homeFlag = args[args.indexOf('-d') + 1];
  const shellFlag = args[args.indexOf('-s') + 1];
  const groupFlag = args[args.indexOf('-G') + 1];

  const uid = nextId(Object.values(state.users).map((u) => u.uid));
  const gid = nextId(Object.values(state.groups).map((g) => g.gid));
  const home = args.includes('-d') && homeFlag ? homeFlag : `/home/${name}`;

  state.groups[name] = { name, gid, members: [name] };
  state.users[name] = {
    name,
    uid,
    gid,
    groups: [name],
    home,
    shell: args.includes('-s') && shellFlag ? shellFlag : '/bin/bash',
    hasPassword: false,
  };

  if (args.includes('-G') && groupFlag) {
    for (const extra of groupFlag.split(',')) {
      if (!state.groups[extra]) {
        return fail(state, `useradd: group '${extra}' does not exist`, 6);
      }
      state.groups[extra].members.push(name);
      state.users[name].groups.push(extra);
    }
  }

  if (wantsHome) {
    writeFile(state.fs, `${home}/.bashrc`, '# ~/.bashrc\n', name, name);
    const homeDir = getNode(state.fs, home);
    if (homeDir && isDir(homeDir)) {
      homeDir.owner = name;
      homeDir.group = name;
      homeDir.mode = 0o755;
    }
  }

  syncAccountFiles(state);
  return ok(state);
};

const userdel: Command = (state, argv) => {
  const denied = requireRoot(state, 'userdel');
  if (denied) return fail(state, denied);
  const name = argv.filter((a, i) => i > 0 && !a.startsWith('-')).pop();
  if (!name || !state.users[name]) {
    return fail(state, `userdel: user '${name}' does not exist`, 6);
  }
  delete state.users[name];
  for (const group of Object.values(state.groups)) {
    group.members = group.members.filter((m) => m !== name);
  }
  syncAccountFiles(state);
  return ok(state);
};

const groupadd: Command = (state, argv) => {
  const denied = requireRoot(state, 'groupadd');
  if (denied) return fail(state, denied);
  const name = argv.filter((a, i) => i > 0 && !a.startsWith('-')).pop();
  if (!name) return fail(state, 'groupadd: missing operand');
  if (state.groups[name])
    return fail(state, `groupadd: group '${name}' already exists`, 9);
  state.groups[name] = {
    name,
    gid: nextId(Object.values(state.groups).map((g) => g.gid)),
    members: [],
  };
  syncAccountFiles(state);
  return ok(state);
};

const groupdel: Command = (state, argv) => {
  const denied = requireRoot(state, 'groupdel');
  if (denied) return fail(state, denied);
  const name = argv[1];
  if (!name || !state.groups[name]) {
    return fail(state, `groupdel: group '${name}' does not exist`, 6);
  }
  delete state.groups[name];
  for (const account of Object.values(state.users)) {
    account.groups = account.groups.filter((g) => g !== name);
  }
  syncAccountFiles(state);
  return ok(state);
};

const usermod: Command = (state, argv) => {
  const denied = requireRoot(state, 'usermod');
  if (denied) return fail(state, denied);

  const args = argv.slice(1);
  const name = args.filter((a) => !a.startsWith('-')).pop();
  const account = name ? state.users[name] : undefined;
  if (!account) return fail(state, `usermod: user '${name}' does not exist`, 6);

  // Short flags combine: -aG is the idiomatic spelling, not -a -G.
  const shortFlags = args
    .filter((a) => a.startsWith('-') && !a.startsWith('--'))
    .join('');
  const groupIndex = args.findIndex(
    (a) =>
      a === '--groups' ||
      (a.startsWith('-') && !a.startsWith('--') && a.includes('G')),
  );
  const append = shortFlags.includes('a') || args.includes('--append');
  if (groupIndex !== -1) {
    const list = args[groupIndex + 1];
    if (!list || list.startsWith('-'))
      return fail(state, 'usermod: option requires an argument -- G');
    const wanted = list.split(',');
    for (const group of wanted) {
      if (!state.groups[group]) {
        return fail(state, `usermod: group '${group}' does not exist`, 6);
      }
    }
    if (!append) {
      // -G without -a REPLACES supplementary groups — the classic footgun.
      for (const group of Object.values(state.groups)) {
        if (group.name === account.name) continue;
        group.members = group.members.filter((m) => m !== account.name);
      }
      account.groups = [account.name];
    }
    for (const group of wanted) {
      if (!account.groups.includes(group)) account.groups.push(group);
      if (!state.groups[group].members.includes(account.name)) {
        state.groups[group].members.push(account.name);
      }
    }
  }

  const shellIndex = args.indexOf('-s');
  if (shellIndex !== -1 && args[shellIndex + 1])
    account.shell = args[shellIndex + 1];

  const homeIndex = args.indexOf('-d');
  if (homeIndex !== -1 && args[homeIndex + 1])
    account.home = args[homeIndex + 1];

  syncAccountFiles(state);
  return ok(state);
};

const passwd: Command = (state, argv) => {
  const name =
    argv.filter((a, i) => i > 0 && !a.startsWith('-')).pop() ?? state.user;
  const account = state.users[name];
  if (!account) return fail(state, `passwd: user '${name}' does not exist`);
  if (state.user !== 'root' && state.user !== name) {
    return fail(
      state,
      'passwd: You may not view or modify password information for other users.',
    );
  }
  if (argv.includes('-l')) {
    account.hasPassword = false;
    return ok(state, `passwd: password expiry information changed.`);
  }
  account.hasPassword = true;
  return ok(state, `passwd: password updated successfully`);
};

const chmod: Command = (state, argv) => {
  const args = argv.slice(1).filter((a) => a !== '-R' && a !== '--recursive');
  const recursive = argv.includes('-R') || argv.includes('--recursive');
  const spec = args[0];
  const targets = args.slice(1);
  if (!spec || targets.length === 0) {
    return fail(state, 'chmod: missing operand');
  }

  for (const target of targets) {
    const path = resolvePath(state, target);
    const node = getNode(state.fs, path);
    if (!node)
      return fail(
        state,
        `chmod: cannot access '${target}': No such file or directory`,
      );
    if (state.user !== 'root' && node.owner !== state.user) {
      return fail(
        state,
        `chmod: changing permissions of '${target}': Operation not permitted`,
      );
    }
    const paths = recursive ? walk(state.fs, path) : [path];
    for (const each of paths) {
      const target2 = getNode(state.fs, each);
      if (!target2) continue;
      const mode = parseMode(spec, target2.mode);
      if (mode === null) {
        return fail(state, `chmod: invalid mode: '${spec}'`);
      }
      target2.mode = mode;
    }
  }
  return ok(state);
};

const chownOrChgrp =
  (isChown: boolean): Command =>
  (state, argv) => {
    const name = isChown ? 'chown' : 'chgrp';
    const denied = requireRoot(state, name);
    if (denied) return fail(state, denied);

    const args = argv.slice(1).filter((a) => a !== '-R' && a !== '--recursive');
    const recursive = argv.includes('-R') || argv.includes('--recursive');
    const spec = args[0];
    const targets = args.slice(1);
    if (!spec || targets.length === 0)
      return fail(state, `${name}: missing operand`);

    const [ownerRaw, groupRaw] = isChown ? spec.split(':') : [null, spec];
    if (ownerRaw && !state.users[ownerRaw]) {
      return fail(state, `${name}: invalid user: '${spec}'`);
    }
    if (groupRaw && !state.groups[groupRaw]) {
      return fail(state, `${name}: invalid group: '${spec}'`);
    }

    for (const target of targets) {
      const path = resolvePath(state, target);
      if (!getNode(state.fs, path)) {
        return fail(
          state,
          `${name}: cannot access '${target}': No such file or directory`,
        );
      }
      for (const each of recursive ? walk(state.fs, path) : [path]) {
        const node = getNode(state.fs, each);
        if (!node) continue;
        if (ownerRaw) node.owner = ownerRaw;
        if (groupRaw) node.group = groupRaw;
      }
    }
    return ok(state);
  };

const su: Command = (state, argv) => {
  const target = argv.slice(1).find((a) => !a.startsWith('-')) ?? 'root';
  const account = state.users[target];
  if (!account) return fail(state, `su: user ${target} does not exist`);
  if (state.user !== 'root' && !account.hasPassword) {
    return fail(state, 'su: Authentication failure');
  }
  state.user = target;
  state.cwd = account.home;
  state.env.HOME = account.home;
  state.env.USER = target;
  return ok(state);
};

const exitCmd: Command = (state) => {
  if (state.user === 'root' && state.users.root) {
    return ok(state, 'logout');
  }
  return ok(state, 'logout');
};

const stat: Command = (state, argv) => {
  const target = argv[1];
  if (!target) return fail(state, 'stat: missing operand');
  const path = resolvePath(state, target);
  const node = getNode(state.fs, path);
  if (!node)
    return fail(
      state,
      `stat: cannot statx '${target}': No such file or directory`,
    );
  const octal = (node.mode & 0o777).toString(8).padStart(4, '0');
  return ok(
    state,
    [
      `  File: ${path}`,
      `  Size: ${node.type === 'file' ? node.content.length : 4096}\t${node.type === 'dir' ? 'directory' : 'regular file'}`,
      `Access: (${octal}/${node.type === 'dir' ? 'd' : '-'}${'rwxrwxrwx'
        .split('')
        .map((c, i) => ((node.mode >> (8 - i)) & 1 ? c : '-'))
        .join(
          '',
        )})  Uid: (${state.users[node.owner]?.uid ?? 0}/${node.owner})   Gid: (${state.groups[node.group]?.gid ?? 0}/${node.group})`,
    ].join('\n'),
  );
};

const umask: Command = (state, argv) => {
  if (!argv[1]) return ok(state, state.env.UMASK ?? '0022');
  state.env.UMASK = argv[1];
  return ok(state);
};

const lsAccessCheck: Command = (state, argv) => {
  const path = resolvePath(state, argv[1] ?? '.');
  const node = getNode(state.fs, path);
  if (!node) return fail(state, `test: ${argv[1]}: No such file or directory`);
  return hasAccess(state, node, 'r')
    ? ok(state)
    : fail(state, 'Permission denied');
};

export const PERM_COMMANDS: Record<string, Command> = {
  whoami,
  id,
  groups: groupsCmd,
  useradd,
  adduser: useradd,
  userdel,
  groupadd,
  addgroup: groupadd,
  groupdel,
  usermod,
  passwd,
  chmod,
  chown: chownOrChgrp(true),
  chgrp: chownOrChgrp(false),
  su,
  exit: exitCmd,
  logout: exitCmd,
  stat,
  umask,
  test: lsAccessCheck,
};

import { syncAccountFiles } from './commands/perms';
import { getNode, makeDir, mkdirp, writeFile } from './fs';
import { runLine } from './run';
import type {
  DirNode,
  DockerState,
  GitState,
  K8sState,
  NetState,
  Process,
  Service,
  ShellState,
  TerraformState,
  UserAccount,
} from './types';

export type FileSpec =
  string | { content: string; mode?: number; owner?: string; group?: string };

export type DirSpec =
  string | { path: string; mode?: number; owner?: string; group?: string };

export type MachineOptions = {
  hostname?: string;
  /** Who the player is logged in as. */
  user?: string;
  cwd?: string;
  /** Extra accounts beyond root and the login user. */
  users?: {
    name: string;
    groups?: string[];
    home?: string;
    hasPassword?: boolean;
  }[];
  groups?: string[];
  dirs?: DirSpec[];
  files?: Record<string, FileSpec>;
  env?: Record<string, string>;
  processes?: Partial<Process>[];
  services?: (Partial<Service> & { name: string })[];
  net?: Partial<NetState>;
  git?: Partial<GitState>;
  docker?: Partial<DockerState>;
  k8s?: Partial<K8sState>;
  terraform?: Partial<TerraformState>;
  /**
   * Make the first sudo ask for a password. Off by default: in every mission
   * after the one that teaches sudo, the player is assumed to have
   * authenticated earlier in the shift — which is exactly what sudo's
   * credential cache does on a real box.
   */
  sudoLocked?: boolean;
};

const emptyGit = (): GitState => ({
  initialized: false,
  root: '/',
  branch: 'main',
  branches: {},
  commits: [],
  index: {},
  remotes: {},
  tags: {},
  pushed: {},
  conflicts: [],
  merging: null,
  userName: null,
  userEmail: null,
});

const emptyDocker = (): DockerState => ({
  images: [],
  containers: [],
  networks: ['bridge', 'host', 'none'],
  volumes: [],
  layerCache: [],
});

const emptyK8s = (): K8sState => ({
  namespace: 'default',
  namespaces: ['default', 'kube-system'],
  pods: [],
  deployments: [],
  services: [],
  configmaps: [],
  secrets: [],
  ingresses: [],
});

const emptyTerraform = (): TerraformState => ({
  initialized: false,
  planned: [],
  applied: [],
  hasStateFile: false,
});

const emptyNet = (): NetState => ({
  interfaces: [
    { name: 'lo', ip: '127.0.0.1', prefix: 8, up: true },
    { name: 'eth0', ip: '10.0.0.5', prefix: 24, up: true },
  ],
  hosts: { localhost: '127.0.0.1' },
  dns: {},
  listening: [{ port: 22, proto: 'tcp', process: 'sshd', address: '0.0.0.0' }],
  firewall: { enabled: false, rules: [] },
  http: {},
  reachable: ['127.0.0.1', 'localhost', '10.0.0.5'],
});

const SKELETON = [
  '/bin',
  '/boot',
  '/dev',
  '/etc',
  '/etc/ssh',
  '/etc/systemd/system',
  '/home',
  '/lib',
  '/opt',
  '/root',
  '/srv',
  '/tmp',
  '/usr/bin',
  '/usr/local/bin',
  '/usr/sbin',
  '/var/log',
  '/var/www',
];

/**
 * Build a fresh Ubuntu-ish box. Missions call this with just the bits they
 * care about, so a mission file stays a description of the scenario rather
 * than a pile of setup code.
 */
export const makeMachine = (options: MachineOptions = {}): ShellState => {
  const hostname = options.hostname ?? 'app-01';
  const user = options.user ?? 'deploy';
  const home = user === 'root' ? '/root' : `/home/${user}`;

  const fs: DirNode = makeDir('root', 'root', 0o755);
  for (const path of SKELETON) mkdirp(fs, path, 'root', 'root');
  // /tmp is world-writable with the sticky bit on every real box; without this
  // an unprivileged player can't even scratch a file there.
  const tmp = getNode(fs, '/tmp');
  if (tmp && tmp.type === 'dir') tmp.mode = 0o1777;

  const users: Record<string, UserAccount> = {
    root: {
      name: 'root',
      uid: 0,
      gid: 0,
      groups: ['root'],
      home: '/root',
      shell: '/bin/bash',
      hasPassword: true,
    },
  };
  const groups: Record<
    string,
    { name: string; gid: number; members: string[] }
  > = {
    root: { name: 'root', gid: 0, members: ['root'] },
    sudo: { name: 'sudo', gid: 27, members: [] },
  };

  for (const name of options.groups ?? []) {
    if (!groups[name]) {
      groups[name] = {
        name,
        gid: 900 + Object.keys(groups).length,
        members: [],
      };
    }
  }

  // A scenario can override the login user's own entry (e.g. to put them in
  // the docker group) by listing them explicitly in `users`.
  const override = (options.users ?? []).find((each) => each.name === user);
  const declared = [
    ...(user === 'root'
      ? []
      : [
          override ?? { name: user, groups: ['sudo'], home, hasPassword: true },
        ]),
    ...(options.users ?? []).filter((each) => each.name !== user),
  ];

  let uid = 1000;
  for (const spec of declared) {
    if (users[spec.name]) continue;
    const accountHome = spec.home ?? `/home/${spec.name}`;
    if (!groups[spec.name]) {
      groups[spec.name] = { name: spec.name, gid: uid, members: [spec.name] };
    }
    users[spec.name] = {
      name: spec.name,
      uid,
      gid: groups[spec.name].gid,
      groups: [spec.name, ...(spec.groups ?? [])],
      home: accountHome,
      shell: '/bin/bash',
      hasPassword: spec.hasPassword ?? true,
    };
    for (const group of spec.groups ?? []) {
      if (!groups[group]) {
        groups[group] = {
          name: group,
          gid: 900 + Object.keys(groups).length,
          members: [],
        };
      }
      groups[group].members.push(spec.name);
    }
    mkdirp(fs, accountHome, spec.name, spec.name, 0o755);
    const node = getNode(fs, accountHome);
    if (node && node.type === 'dir') {
      node.owner = spec.name;
      node.group = spec.name;
    }
    uid += 1;
  }

  const services: Record<string, Service> = {};
  for (const spec of options.services ?? []) {
    services[spec.name] = {
      name: spec.name,
      description: spec.description ?? `${spec.name} service`,
      active: spec.active ?? false,
      enabled: spec.enabled ?? false,
      log: spec.log ?? [],
      port: spec.port,
    };
  }

  const processes: Process[] = [
    {
      pid: 1,
      user: 'root',
      command: '/sbin/init',
      cpu: 0,
      mem: 0.3,
      state: 'S',
    },
    {
      pid: 412,
      user: 'root',
      command: '/usr/sbin/sshd -D',
      cpu: 0,
      mem: 0.5,
      state: 'S',
    },
    ...(options.processes ?? []).map((p, index) => ({
      pid: p.pid ?? 1400 + index,
      user: p.user ?? 'root',
      command: p.command ?? 'unknown',
      cpu: p.cpu ?? 0.2,
      mem: p.mem ?? 1,
      state: p.state ?? ('S' as const),
    })),
  ];

  const state: ShellState = {
    hostname,
    fs,
    cwd: options.cwd ?? home,
    user,
    users,
    groups,
    env: {
      HOME: home,
      USER: user,
      SHELL: '/bin/bash',
      PATH: '/usr/local/bin:/usr/bin:/bin',
      PWD: options.cwd ?? home,
      LANG: 'en_US.UTF-8',
      ...options.env,
    },
    processes,
    services,
    net: { ...emptyNet(), ...options.net },
    git: { ...emptyGit(), ...options.git },
    docker: { ...emptyDocker(), ...options.docker },
    k8s: { ...emptyK8s(), ...options.k8s },
    terraform: { ...emptyTerraform(), ...options.terraform },
    sudo: {
      unlocked: options.sudoLocked !== true,
      pending: null,
      attempts: 0,
      password: 'horih2031',
    },
    history: [],
    nextPid: 1500 + processes.length,
  };

  // Auto-start whatever was declared active so ports and processes line up.
  for (const service of Object.values(state.services)) {
    if (!service.active) continue;
    state.processes.push({
      pid: state.nextPid,
      user: 'root',
      command: `/usr/sbin/${service.name}`,
      cpu: 0.4,
      mem: 1.8,
      state: 'S',
    });
    state.nextPid += 1;
    if (service.port !== undefined) {
      state.net.listening.push({
        port: service.port,
        proto: 'tcp',
        process: service.name,
        address: '0.0.0.0',
      });
    }
  }

  for (const spec of options.dirs ?? []) {
    const path = typeof spec === 'string' ? spec : spec.path;
    const owner = typeof spec === 'string' ? 'root' : (spec.owner ?? 'root');
    const group = typeof spec === 'string' ? owner : (spec.group ?? owner);
    mkdirp(
      fs,
      path,
      owner,
      group,
      typeof spec === 'string' ? 0o755 : (spec.mode ?? 0o755),
    );
    const node = getNode(fs, path);
    if (node && node.type === 'dir') {
      node.owner = owner;
      node.group = group;
      if (typeof spec !== 'string' && spec.mode !== undefined)
        node.mode = spec.mode;
    }
  }

  for (const [path, spec] of Object.entries(options.files ?? {})) {
    const content = typeof spec === 'string' ? spec : spec.content;
    const owner = typeof spec === 'string' ? 'root' : (spec.owner ?? 'root');
    const group = typeof spec === 'string' ? owner : (spec.group ?? owner);
    writeFile(fs, path, content, owner, group);
    const node = getNode(fs, path);
    if (node && typeof spec !== 'string' && spec.mode !== undefined)
      node.mode = spec.mode;
  }

  writeFile(fs, '/etc/hostname', `${hostname}\n`, 'root', 'root');
  writeFile(
    fs,
    '/etc/hosts',
    Object.entries(state.net.hosts)
      .map(([name, ip]) => `${ip}\t${name}`)
      .concat(`127.0.1.1\t${hostname}`)
      .join('\n') + '\n',
    'root',
    'root',
  );
  syncAccountFiles(state);

  return state;
};

/**
 * Run setup commands through the real shell so a scenario's starting point is
 * always something the engine could actually produce — then wipe the history
 * so the player isn't credited with commands they never typed.
 */
export const seed = (state: ShellState, lines: string[]): ShellState => {
  let current = state;
  for (const line of lines) current = runLine(current, line).state;
  current.history = [];
  return current;
};

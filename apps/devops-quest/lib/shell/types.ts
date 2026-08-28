/**
 * The whole simulated machine as one plain data object.
 *
 * Nothing here imports React or touches the DOM: every command is a pure
 * function `(state, argv, stdin) => result`, so a mission's success check is
 * an ordinary predicate over this shape and the engine is unit-testable on
 * its own. Same split as apps/solitaire (pure rules, separate renderer).
 */

export type FileNode = {
  type: 'file';
  content: string;
  mode: number;
  owner: string;
  group: string;
};

export type DirNode = {
  type: 'dir';
  mode: number;
  owner: string;
  group: string;
  children: Record<string, FsNode>;
};

export type FsNode = FileNode | DirNode;

export type UserAccount = {
  name: string;
  uid: number;
  gid: number;
  groups: string[];
  home: string;
  shell: string;
  hasPassword: boolean;
};

export type Group = {
  name: string;
  gid: number;
  members: string[];
};

export type Process = {
  pid: number;
  user: string;
  command: string;
  cpu: number;
  mem: number;
  state: 'R' | 'S' | 'Z';
};

export type Service = {
  name: string;
  description: string;
  active: boolean;
  enabled: boolean;
  /** What `journalctl -u <name>` prints, newest last. */
  log: string[];
  /** Port the unit binds when it starts, if any. */
  port?: number;
};

export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';

export type DnsRecord = {
  type: DnsRecordType;
  value: string;
  ttl: number;
};

export type ListeningPort = {
  port: number;
  proto: 'tcp' | 'udp';
  process: string;
  address: string;
};

/** What `df` reports. Declared per machine, in 1K blocks. */
export type Disk = {
  size: number;
  used: number;
};

export type HttpResponse = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
};

export type NetState = {
  interfaces: { name: string; ip: string; prefix: number; up: boolean }[];
  /** /etc/hosts overrides, name -> ip. Mirrored into the real file too. */
  hosts: Record<string, string>;
  /** Authoritative zone data the `dig` command reads. */
  dns: Record<string, DnsRecord[]>;
  listening: ListeningPort[];
  firewall: {
    enabled: boolean;
    rules: { port: number; proto: 'tcp' | 'udp'; action: 'allow' | 'deny' }[];
  };
  /** URL (or host) -> canned response for `curl`. */
  http: Record<string, HttpResponse>;
  /** Hosts that answer `ping`. */
  reachable: string[];
};

/** A committed snapshot of the working tree: relative path -> content. */
export type GitTree = Record<string, string>;

export type GitCommit = {
  hash: string;
  message: string;
  parents: string[];
  author: string;
  tree: GitTree;
};

export type GitState = {
  initialized: boolean;
  /** Absolute path of the working tree. */
  root: string;
  branch: string;
  /** branch name -> head commit hash */
  branches: Record<string, string>;
  commits: GitCommit[];
  /** The staging area, as a full snapshot rather than a list of paths. */
  index: GitTree;
  remotes: Record<string, string>;
  tags: Record<string, string>;
  /** branch -> hash last pushed to origin */
  pushed: Record<string, string>;
  /** Files left with conflict markers by a failed merge. */
  conflicts: string[];
  /** Branch being merged in, while conflicts are unresolved. */
  merging: string | null;
  userName: string | null;
  userEmail: string | null;
};

export type DockerImage = {
  repo: string;
  tag: string;
  id: string;
  size: string;
  created: string;
};

export type DockerContainer = {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'exited' | 'created';
  ports: string[];
  command: string;
  logs: string[];
  env: Record<string, string>;
  volumes: string[];
  network: string;
};

export type DockerState = {
  images: DockerImage[];
  containers: DockerContainer[];
  networks: string[];
  volumes: string[];
  /** Layer cache keyed by Dockerfile instruction, so rebuilds can say CACHED. */
  layerCache: string[];
};

export type K8sPod = {
  name: string;
  deployment: string | null;
  ready: string;
  status: string;
  restarts: number;
  age: string;
  image: string;
  node: string;
  labels: Record<string, string>;
  logs: string[];
  events: string[];
};

export type K8sDeployment = {
  name: string;
  replicas: number;
  ready: number;
  image: string;
  revision: number;
  history: { revision: number; image: string }[];
  labels: Record<string, string>;
};

export type K8sService = {
  name: string;
  type: string;
  clusterIp: string;
  ports: string;
  selector: string;
};

export type K8sState = {
  namespace: string;
  namespaces: string[];
  pods: K8sPod[];
  deployments: K8sDeployment[];
  services: K8sService[];
  configmaps: { name: string; data: Record<string, string> }[];
  secrets: { name: string; keys: string[] }[];
  ingresses: { name: string; host: string; service: string; tls: boolean }[];
};

export type TerraformState = {
  initialized: boolean;
  /** Resource addresses the last `plan` would add. */
  planned: string[];
  applied: string[];
  hasStateFile: boolean;
};

/**
 * sudo caches your credentials per terminal for about fifteen minutes, which
 * is why it asks once and then goes quiet. Modelling that is the difference
 * between a learner meeting `[sudo] password for ...` here or on a real server.
 */
export type SudoState = {
  /** Already authenticated in this session — sudo stays silent. */
  unlocked: boolean;
  /** The command line held back until a password arrives. */
  pending: string | null;
  attempts: number;
  password: string;
};

export type ShellState = {
  hostname: string;
  fs: DirNode;
  cwd: string;
  user: string;
  users: Record<string, UserAccount>;
  groups: Record<string, Group>;
  env: Record<string, string>;
  processes: Process[];
  services: Record<string, Service>;
  net: NetState;
  git: GitState;
  docker: DockerState;
  k8s: K8sState;
  terraform: TerraformState;
  sudo: SudoState;
  /** Every command line the player has submitted, in order. */
  history: string[];
  /** Reported by `df`; a mission can declare a nearly-full disk. */
  disk: Disk;
  /** `user@host` for every ssh session that actually got in. */
  logins: string[];
  nextPid: number;
  /** Set when a command asks the shell to clear the screen. */
  clearScreen?: boolean;
};

export type CommandResult = {
  state: ShellState;
  stdout: string;
  stderr: string;
  code: number;
};

export type Command = (
  state: ShellState,
  argv: string[],
  stdin: string,
) => CommandResult;

/** Convenience for commands that only produce output. */
export const ok = (
  state: ShellState,
  stdout = '',
  code = 0,
): CommandResult => ({ state, stdout, stderr: '', code });

export const fail = (
  state: ShellState,
  stderr: string,
  code = 1,
): CommandResult => ({ state, stdout: '', stderr, code });

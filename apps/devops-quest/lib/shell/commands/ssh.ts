import {
  basename,
  dirname,
  getNode,
  isDir,
  isFile,
  mkdirp,
  readFile,
  resolvePath,
  writeFile,
} from '../fs';
import { type Command, fail, ok, type ShellState } from '../types';

/** Deterministic stand-in for a key fingerprint — no clock, no randomness. */
const fingerprint = (seed: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  const base = hash.toString(36).toUpperCase().padStart(7, 'X');
  return `AAAAC3NzaC1lZDI1NTE5AAAAI${base}${base.split('').reverse().join('')}`;
};

const keygen: Command = (state, argv) => {
  const args = argv.slice(1);
  const valueOf = (flag: string): string | null => {
    const index = args.indexOf(flag);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
  };

  const type = valueOf('-t') ?? 'rsa';
  if (!['ed25519', 'rsa', 'ecdsa'].includes(type)) {
    return fail(state, `unknown key type ${type}`);
  }

  const home = state.users[state.user]?.home ?? '/root';
  const path = resolvePath(state, valueOf('-f') ?? `${home}/.ssh/id_${type}`);
  const comment = valueOf('-C') ?? `${state.user}@${state.hostname}`;

  if (getNode(state.fs, path)) {
    return fail(state, `${path} already exists.\nOverwrite (y/n)? aborted.`, 1);
  }

  mkdirp(state.fs, dirname(path), state.user, state.user, 0o700);
  const sshDir = getNode(state.fs, dirname(path));
  if (sshDir && isDir(sshDir)) {
    sshDir.owner = state.user;
    sshDir.group = state.user;
    sshDir.mode = 0o700;
  }

  const print = fingerprint(`${path}:${comment}`);
  writeFile(
    state.fs,
    path,
    `-----BEGIN OPENSSH PRIVATE KEY-----\n${print}\n-----END OPENSSH PRIVATE KEY-----\n`,
    state.user,
    state.user,
  );
  const priv = getNode(state.fs, path);
  if (priv) priv.mode = 0o600;

  writeFile(
    state.fs,
    `${path}.pub`,
    `ssh-${type} ${print} ${comment}\n`,
    state.user,
    state.user,
  );
  const pub = getNode(state.fs, `${path}.pub`);
  if (pub) pub.mode = 0o644;

  return ok(
    state,
    [
      `Generating public/private ${type} key pair.`,
      `Your identification has been saved in ${path}`,
      `Your public key has been saved in ${path}.pub`,
      'The key fingerprint is:',
      `SHA256:${print.slice(25, 48)} ${comment}`,
    ].join('\n'),
  );
};

type SshTarget = { user: string; host: string };

const parseTarget = (raw: string, fallbackUser: string): SshTarget => {
  const [left, right] = raw.includes('@')
    ? raw.split('@')
    : [fallbackUser, raw];
  return { user: left, host: right };
};

const sshConfigSays = (state: ShellState, key: string): string | null => {
  const config = readFile(state.fs, '/etc/ssh/sshd_config');
  if (!config) return null;
  for (const line of config.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed === '') continue;
    const [name, ...rest] = trimmed.split(/\s+/);
    if (name.toLowerCase() === key.toLowerCase()) return rest.join(' ');
  }
  return null;
};

const UNPROTECTED_BANNER = [
  '@'.repeat(59),
  '@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @',
  '@'.repeat(59),
];

/**
 * A key login that enforces the rules people actually get wrong: the private
 * key must not be group/world readable, ~/.ssh must not be wide open, and the
 * public key has to really be in the target's authorized_keys.
 */
const ssh: Command = (state, argv) => {
  const args = argv.slice(1);
  const identityIndex = args.indexOf('-i');
  const identity = identityIndex !== -1 ? args[identityIndex + 1] : null;
  const portIndex = args.indexOf('-p');
  const port = portIndex !== -1 ? Number(args[portIndex + 1]) : 22;

  const targetRaw = args.find(
    (a, index) =>
      !a.startsWith('-') &&
      args[index - 1] !== '-i' &&
      args[index - 1] !== '-p',
  );
  if (!targetRaw)
    return fail(
      state,
      'usage: ssh [-i identity_file] [-p port] destination',
      255,
    );

  const target = parseTarget(targetRaw, state.user);

  const listening = state.net.listening.some((entry) => entry.port === port);
  if (!listening) {
    return fail(
      state,
      `ssh: connect to host ${target.host} port ${port}: Connection refused`,
      255,
    );
  }
  if (
    state.net.firewall.enabled &&
    !state.net.firewall.rules.some(
      (rule) => rule.port === port && rule.action === 'allow',
    )
  ) {
    return fail(
      state,
      `ssh: connect to host ${target.host} port ${port}: Connection timed out`,
      255,
    );
  }

  const home = state.users[state.user]?.home ?? '/root';
  const keyPath = resolvePath(state, identity ?? `${home}/.ssh/id_ed25519`);
  const keyNode = getNode(state.fs, keyPath);

  if (!keyNode || !isFile(keyNode)) {
    if (sshConfigSays(state, 'PasswordAuthentication') === 'no') {
      return fail(
        state,
        `${target.user}@${target.host}: Permission denied (publickey).`,
        255,
      );
    }
    return fail(
      state,
      `${target.user}@${target.host}'s password: \nPermission denied, please try again.`,
      255,
    );
  }

  // OpenSSH point-blank refuses a private key that anyone else can read.
  if ((keyNode.mode & 0o077) !== 0) {
    return fail(
      state,
      [
        ...UNPROTECTED_BANNER,
        `Permissions 0${(keyNode.mode & 0o777).toString(8)} for '${keyPath}' are too open.`,
        'It is required that your private key files are NOT accessible by others.',
        'This private key will be ignored.',
        `${target.user}@${target.host}: Permission denied (publickey).`,
      ].join('\n'),
      255,
    );
  }

  const targetHome = state.users[target.user]?.home;
  if (!targetHome) {
    return fail(
      state,
      `${target.user}@${target.host}: Permission denied (publickey).`,
      255,
    );
  }

  const sshDir = getNode(state.fs, `${targetHome}/.ssh`);
  if (sshDir && (sshDir.mode & 0o077) !== 0) {
    return fail(
      state,
      [
        `Authentication refused: bad ownership or modes for directory ${targetHome}/.ssh`,
        `${target.user}@${target.host}: Permission denied (publickey).`,
      ].join('\n'),
      255,
    );
  }

  const authorized =
    readFile(state.fs, `${targetHome}/.ssh/authorized_keys`) ?? '';
  const pub = readFile(state.fs, `${keyPath}.pub`) ?? '';
  const pubBody = pub.trim().split(/\s+/)[1] ?? ' ';

  if (!authorized.includes(pubBody)) {
    return fail(
      state,
      `${target.user}@${target.host}: Permission denied (publickey).`,
      255,
    );
  }

  return ok(
    state,
    [
      'Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-41-generic x86_64)',
      '',
      'Last login: Fri Mar 14 09:18:02 2031 from 10.0.0.1',
      `${target.user}@${target.host}:~$ logout`,
      `Connection to ${target.host} closed.`,
    ].join('\n'),
  );
};

const copyId: Command = (state, argv) => {
  const args = argv.slice(1);
  const identityIndex = args.indexOf('-i');
  const home = state.users[state.user]?.home ?? '/root';
  const pubPath = resolvePath(
    state,
    identityIndex !== -1
      ? args[identityIndex + 1]
      : `${home}/.ssh/id_ed25519.pub`,
  );
  const targetRaw = args.find(
    (a, index) => !a.startsWith('-') && args[index - 1] !== '-i',
  );
  if (!targetRaw)
    return fail(state, 'usage: ssh-copy-id [-i identity] user@host');

  const pub = readFile(
    state.fs,
    pubPath.endsWith('.pub') ? pubPath : `${pubPath}.pub`,
  );
  if (!pub) {
    return fail(
      state,
      `/usr/bin/ssh-copy-id: ERROR: failed to open ID file '${pubPath}': No such file`,
      1,
    );
  }

  const target = parseTarget(targetRaw, state.user);
  const targetHome = state.users[target.user]?.home;
  if (!targetHome)
    return fail(state, `${target.user}@${target.host}: Permission denied`, 255);

  mkdirp(state.fs, `${targetHome}/.ssh`, target.user, target.user, 0o700);
  const previous =
    readFile(state.fs, `${targetHome}/.ssh/authorized_keys`) ?? '';
  writeFile(
    state.fs,
    `${targetHome}/.ssh/authorized_keys`,
    previous + pub,
    target.user,
    target.user,
  );
  const node = getNode(state.fs, `${targetHome}/.ssh/authorized_keys`);
  if (node) node.mode = 0o600;

  return ok(state, 'Number of key(s) added: 1');
};

/**
 * scp/rsync operate inside the same simulated filesystem: a `host:/path`
 * destination simply resolves to that path. The mission is about the syntax
 * and the direction of the copy, which this preserves exactly.
 */
const transfer =
  (name: string): Command =>
  (state, argv) => {
    const operands = argv.slice(1).filter((a) => !a.startsWith('-'));
    if (operands.length < 2) return fail(state, `${name}: missing destination`);

    const strip = (spec: string): string =>
      spec.includes(':') ? spec.slice(spec.indexOf(':') + 1) : spec;

    const destSpec = operands[operands.length - 1];
    const destPath = resolvePath(state, strip(destSpec));

    for (const sourceSpec of operands.slice(0, -1)) {
      const sourcePath = resolvePath(state, strip(sourceSpec));
      const content = readFile(state.fs, sourcePath);
      if (content === null) {
        return fail(
          state,
          `${name}: ${strip(sourceSpec)}: No such file or directory`,
          1,
        );
      }
      const destNode = getNode(state.fs, destPath);
      const finalPath = isDir(destNode)
        ? `${destPath}/${basename(sourcePath)}`
        : destPath;
      writeFile(state.fs, finalPath, content, state.user, state.user);
    }

    return ok(state, `${operands.length - 1} file(s) transferred`);
  };

export const SSH_COMMANDS: Record<string, Command> = {
  ssh,
  'ssh-keygen': keygen,
  'ssh-copy-id': copyId,
  scp: transfer('scp'),
  rsync: transfer('rsync'),
};

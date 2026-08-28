import { describe, expect, it } from 'vitest';

import { getNode, modeToString, parseMode, readFile, resolvePath } from './fs';
import { makeMachine } from './machines';
import { parseLine } from './parse';
import { runLine } from './run';
import type { ShellState } from './types';

const run = (state: ShellState, ...lines: string[]) => {
  let current = state;
  let last = {
    state,
    output: [] as ReturnType<typeof runLine>['output'],
    cleared: false,
  };
  for (const line of lines) {
    last = runLine(current, line);
    current = last.state;
  }
  return {
    state: current,
    out: last.output.map((o) => o.text).join('\n'),
    output: last.output,
  };
};

describe('parse', () => {
  const env = { NAME: 'world', EMPTY: '' };

  it('splits words and honours quotes', () => {
    const result = parseLine(
      'echo "hello there" \'raw $NAME\'',
      env,
      '/home/deploy',
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.segments[0].commands[0].argv).toEqual([
      'echo',
      'hello there',
      'raw $NAME',
    ]);
  });

  it('expands variables only outside single quotes', () => {
    const result = parseLine('echo "$NAME" $NAME', env, '/home/deploy');
    if (!result.ok) return;
    expect(result.segments[0].commands[0].argv).toEqual([
      'echo',
      'world',
      'world',
    ]);
  });

  it('expands ~ to the home directory', () => {
    const result = parseLine('ls ~/.ssh', env, '/home/deploy');
    if (!result.ok) return;
    expect(result.segments[0].commands[0].argv).toEqual([
      'ls',
      '/home/deploy/.ssh',
    ]);
  });

  it('builds a pipeline', () => {
    const result = parseLine('cat a | grep b | wc -l', env, '/root');
    if (!result.ok) return;
    expect(result.segments[0].commands).toHaveLength(3);
  });

  it('captures redirects without keeping them as argv', () => {
    const result = parseLine('echo hi > out.txt', env, '/root');
    if (!result.ok) return;
    const [command] = result.segments[0].commands;
    expect(command.argv).toEqual(['echo', 'hi']);
    expect(command.redirects).toEqual([
      { fd: 1, path: 'out.txt', append: false },
    ]);
  });

  it('reports an unterminated quote instead of guessing', () => {
    const result = parseLine('echo "oops', env, '/root');
    expect(result.ok).toBe(false);
  });
});

describe('paths and modes', () => {
  it('normalises .. and .', () => {
    const state = makeMachine({ cwd: '/var/log' });
    expect(resolvePath(state, '../www')).toBe('/var/www');
    expect(resolvePath(state, './nginx/../app.log')).toBe('/var/log/app.log');
  });

  it('renders octal modes the way ls -l does', () => {
    const state = makeMachine({
      files: { '/tmp/key': { content: 'x', mode: 0o600 } },
    });
    const node = getNode(state.fs, '/tmp/key');
    expect(node && modeToString(node)).toBe('-rw-------');
  });

  it('parses symbolic and octal chmod specs', () => {
    expect(parseMode('755', 0o644)).toBe(0o755);
    expect(parseMode('u+x', 0o644)).toBe(0o744);
    expect(parseMode('go-r', 0o644)).toBe(0o600);
    expect(parseMode('a=r', 0o777)).toBe(0o444);
    expect(parseMode('nonsense', 0o644)).toBeNull();
  });
});

describe('core commands', () => {
  it('creates, lists and reads files', () => {
    const { state, out } = run(
      makeMachine({ user: 'deploy' }),
      'mkdir -p /tmp/demo',
      'echo "hello" > /tmp/demo/a.txt',
      'cat /tmp/demo/a.txt',
    );
    expect(out.trim()).toBe('hello');
    expect(readFile(state.fs, '/tmp/demo/a.txt')).toBe('hello\n');
  });

  it('appends with >> instead of truncating', () => {
    const { state } = run(
      makeMachine(),
      'echo one > /tmp/f',
      'echo two >> /tmp/f',
    );
    expect(readFile(state.fs, '/tmp/f')).toBe('one\ntwo\n');
  });

  it('pipes stdout into the next command', () => {
    const { out } = run(
      makeMachine({
        files: { '/tmp/log': 'ok\nERROR boom\nok\nERROR again\n' },
      }),
      'cat /tmp/log | grep ERROR | wc -l',
    );
    expect(out.trim()).toBe('2');
  });

  it('reports unknown commands the way bash does', () => {
    const { out } = run(makeMachine(), 'dokcer ps');
    expect(out).toBe('bash: dokcer: command not found');
  });

  it('stops an && chain when the left side fails', () => {
    const { state } = run(
      makeMachine(),
      'cat /nope && touch /tmp/should-not-exist',
    );
    expect(getNode(state.fs, '/tmp/should-not-exist')).toBeNull();
  });

  it('refuses to remove a directory without -r', () => {
    const { out, state } = run(makeMachine({ dirs: ['/tmp/d'] }), 'rm /tmp/d');
    expect(out).toContain('Is a directory');
    expect(getNode(state.fs, '/tmp/d')).not.toBeNull();
  });

  it('finds files by name pattern', () => {
    const { out } = run(
      makeMachine({ files: { '/etc/a.conf': 'x', '/etc/b.txt': 'x' } }),
      'find /etc -name "*.conf"',
    );
    expect(out).toContain('/etc/a.conf');
    expect(out).not.toContain('/etc/b.txt');
  });
});

describe('permissions', () => {
  it('denies reading a file the user has no rights to', () => {
    const { out } = run(
      makeMachine({
        user: 'deploy',
        files: { '/root/secret': { content: 'x', mode: 0o600, owner: 'root' } },
      }),
      'cat /root/secret',
    );
    expect(out).toContain('Permission denied');
  });

  it('lets root through and lets sudo borrow root', () => {
    const { out } = run(
      makeMachine({
        user: 'deploy',
        files: {
          '/root/secret': { content: 'classified', mode: 0o600, owner: 'root' },
        },
      }),
      'sudo cat /root/secret',
    );
    expect(out.trim()).toBe('classified');
  });

  it('refuses sudo for a user outside the sudo group', () => {
    const { out } = run(
      makeMachine({ user: 'deploy', users: [{ name: 'intern', groups: [] }] }),
      'su intern',
      'sudo whoami',
    );
    expect(out).toContain('not in the sudoers file');
  });

  it('chmod 600 shows up in ls -l and in the node', () => {
    const { state, out } = run(
      makeMachine({
        user: 'deploy',
        files: { '/home/deploy/key': { content: 'k', owner: 'deploy' } },
      }),
      'chmod 600 /home/deploy/key',
      'ls -l /home/deploy/key',
    );
    expect(getNode(state.fs, '/home/deploy/key')?.mode).toBe(0o600);
    expect(out).toContain('-rw-------');
  });

  it('usermod -aG keeps existing groups, plain -G replaces them', () => {
    const append = run(
      makeMachine({
        user: 'root',
        users: [{ name: 'app', groups: ['sudo'] }],
        groups: ['docker'],
      }),
      'usermod -aG docker app',
    );
    expect(append.state.users.app.groups).toContain('sudo');
    expect(append.state.users.app.groups).toContain('docker');

    const replace = run(
      makeMachine({
        user: 'root',
        users: [{ name: 'app', groups: ['sudo'] }],
        groups: ['docker'],
      }),
      'usermod -G docker app',
    );
    expect(replace.state.users.app.groups).not.toContain('sudo');
  });

  it('writes new accounts into /etc/passwd', () => {
    const { state } = run(
      makeMachine({ user: 'root' }),
      'useradd -m -s /bin/bash ci',
    );
    expect(readFile(state.fs, '/etc/passwd')).toContain('ci:x:');
    expect(state.users.ci.home).toBe('/home/ci');
  });
});

describe('processes and services', () => {
  const machine = () =>
    makeMachine({
      user: 'deploy',
      services: [
        {
          name: 'nginx',
          description: 'A high performance web server',
          active: false,
          port: 80,
        },
      ],
    });

  it('systemctl start flips the unit active and opens its port', () => {
    const { state, out } = run(
      machine(),
      'sudo systemctl start nginx',
      'systemctl is-active nginx',
    );
    expect(out.trim()).toBe('active');
    expect(state.net.listening.some((l) => l.port === 80)).toBe(true);
  });

  it('refuses to start a unit without root', () => {
    const { out } = run(machine(), 'systemctl start nginx');
    expect(out).toContain('Access denied');
  });

  it('enable does not start, enable --now does', () => {
    const onlyEnabled = run(machine(), 'sudo systemctl enable nginx');
    expect(onlyEnabled.state.services.nginx.enabled).toBe(true);
    expect(onlyEnabled.state.services.nginx.active).toBe(false);

    const both = run(machine(), 'sudo systemctl enable --now nginx');
    expect(both.state.services.nginx.active).toBe(true);
  });

  it('kill removes the process', () => {
    const state = makeMachine({
      user: 'deploy',
      processes: [
        { pid: 1421, user: 'deploy', command: 'node worker.js', cpu: 98 },
      ],
    });
    const killed = run(state, 'kill -9 1421');
    expect(killed.state.processes.some((p) => p.pid === 1421)).toBe(false);
  });

  it('journalctl -u reads that unit only', () => {
    const state = makeMachine({
      services: [
        { name: 'nginx', log: ['emerg: bind() to 0.0.0.0:80 failed'] },
      ],
    });
    const { out } = run(state, 'journalctl -u nginx');
    expect(out).toContain('bind() to 0.0.0.0:80 failed');
  });
});

describe('man', () => {
  it('serves a page for a known command and refuses an unknown one', () => {
    expect(run(makeMachine(), 'man chmod').out).toContain('chmod');
    expect(run(makeMachine(), 'man frobnicate').out).toContain(
      'No manual entry',
    );
  });
});

describe('sudo authentication', () => {
  const locked = () =>
    makeMachine({
      user: 'deploy',
      sudoLocked: true,
      files: {
        '/root/secret': { content: 'classified', mode: 0o600, owner: 'root' },
      },
    });

  it('asks for a password the first time and holds the command back', () => {
    const { out, state } = run(locked(), 'sudo cat /root/secret');
    expect(out).toContain('[sudo] password for deploy:');
    expect(out).not.toContain('classified');
    expect(state.sudo.pending).toBe('sudo cat /root/secret');
  });

  it('runs the held command once the password is right', () => {
    const { out, state } = run(locked(), 'sudo cat /root/secret', 'horih2031');
    expect(out.trim()).toBe('classified');
    expect(state.sudo.unlocked).toBe(true);
  });

  it('stays quiet on every later sudo — that is the credential cache', () => {
    const { out } = run(
      locked(),
      'sudo cat /root/secret',
      'horih2031',
      'sudo cat /root/secret',
    );
    expect(out).not.toContain('[sudo] password');
    expect(out.trim()).toBe('classified');
  });

  it('rejects a wrong password and gives up after three tries', () => {
    const first = run(locked(), 'sudo cat /root/secret', 'nope');
    expect(first.out).toContain('Sorry, try again.');

    const exhausted = run(locked(), 'sudo cat /root/secret', 'a', 'b', 'c');
    expect(exhausted.out).toContain('3 incorrect password attempts');
    expect(exhausted.state.sudo.pending).toBeNull();
  });

  it('keeps the password out of shell history', () => {
    const { state } = run(locked(), 'sudo cat /root/secret', 'horih2031');
    expect(state.history).not.toContain('horih2031');
  });

  it('does not ask at all in missions that assume an earlier login', () => {
    const { out } = run(
      makeMachine({
        user: 'deploy',
        files: {
          '/root/secret': { content: 'classified', mode: 0o600, owner: 'root' },
        },
      }),
      'sudo cat /root/secret',
    );
    expect(out).not.toContain('[sudo] password');
    expect(out.trim()).toBe('classified');
  });
});

/**
 * A command whose whole job is to report something must print something.
 *
 * `ss -n` returned an empty string: the listing was gated on the flags
 * containing `l` or `t`, so every other spelling fell through to `ok(state,
 * '')`. On screen that is indistinguishable from a broken terminal — the
 * player types a real command, the prompt comes straight back, and there is
 * nothing to react to. Silence is correct for commands that act (`cd`,
 * `chmod`, `mkdir`); it is never correct for one that answers a question.
 */
describe('reporting commands always answer', () => {
  const machine = () =>
    makeMachine({
      user: 'deploy',
      // Something to report: `ls` in an empty directory is rightly silent, and
      // the rule under test is about commands that stay silent when there IS
      // an answer.
      files: { '/home/deploy/notes.txt': { content: 'hello\n' } },
      processes: [
        { pid: 1421, user: 'deploy', command: 'node worker.js', cpu: 98.4 },
      ],
      net: {
        listening: [
          { port: 22, proto: 'tcp', process: 'sshd', address: '0.0.0.0' },
          { port: 80, proto: 'tcp', process: 'nginx', address: '0.0.0.0' },
        ],
      },
    });

  it.each([
    'ss',
    'ss -n',
    'ss -t',
    'ss -l',
    'ss -a',
    'ss -tulpn',
    'ps',
    'ps aux',
    'ls',
    'ls -l',
    'ls -la',
    'ip a',
    'df',
    'df -h',
    'du -sh /var/log',
    'id',
    'whoami',
    'pwd',
    'env',
    'uptime',
    'free',
    'history',
    'docker ps',
    'docker images',
    'kubectl get pods',
  ])('`%s` prints something', (line) => {
    const { out } = run(machine(), line);
    expect(out.trim()).not.toBe('');
  });

  it('ss lists listeners only with -l or -a, like the real tool', () => {
    const port80 = /0\.0\.0\.0:80/;
    expect(run(machine(), 'ss -tulpn').out).toMatch(port80);
    expect(run(machine(), 'ss -l').out).toMatch(port80);
    expect(run(machine(), 'ss -a').out).toMatch(port80);
    // No established connections on this machine, so these are header-only.
    expect(run(machine(), 'ss -n').out).not.toMatch(port80);
    expect(run(machine(), 'ss').out).not.toMatch(port80);
  });

  // The pid column was hardcoded to 1 on every row, so the answer to «which
  // process holds port 80» was not in the output of the command that is
  // supposed to give it. It has to be the listening process's real pid.
  it('ss -p reports the real pid of the listening process', () => {
    const withPids = makeMachine({
      user: 'deploy',
      processes: [
        { pid: 2201, user: 'root', command: 'python3 -m http.server 80' },
      ],
      net: {
        listening: [
          { port: 22, proto: 'tcp', process: 'sshd', address: '0.0.0.0' },
          { port: 80, proto: 'tcp', process: 'python3', address: '0.0.0.0' },
        ],
      },
    });
    const out = run(withPids, 'ss -tulpn').out;
    expect(out).toContain('pid=2201');
    expect(out).toContain('pid=412'); // sshd, from the default process list
    // Without -p there is no process column at all — that is what p asks for.
    expect(run(withPids, 'ss -tuln').out).not.toContain('pid=');
  });

  // l04-m01 declares four listeners and no processes, so looking the owner up
  // in the process table produced a blank column on every row — and its task
  // is «find the line whose process is postgres». Every declared port must
  // have an owner, or the answer is not on screen.
  it('names the process on every listening socket', () => {
    const server = makeMachine({
      user: 'deploy',
      net: {
        listening: [
          { port: 80, proto: 'tcp', process: 'nginx', address: '0.0.0.0' },
          {
            port: 5432,
            proto: 'tcp',
            process: 'postgres',
            address: '127.0.0.1',
          },
          { port: 6379, proto: 'tcp', process: 'redis', address: '127.0.0.1' },
        ],
      },
    });
    const sockets = run(server, 'ss -tulpn').out;
    for (const name of ['nginx', 'postgres', 'redis']) {
      expect(sockets).toContain(`"${name}"`);
    }
    // Every row that lists a port also says who holds it.
    for (const row of sockets.split('\n').filter((l) => l.includes('LISTEN'))) {
      expect(row).toMatch(/users:\(\("[^"]+",pid=\d+/);
    }
    // And they are real entries in the process table, so ps finds them too.
    expect(run(server, 'ps aux').out).toContain('postgres');
  });
});

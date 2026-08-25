import { type Command, fail, ok, type ShellState } from '../types';

const pad = (value: string | number, width: number): string =>
  String(value).padStart(width);

const ps: Command = (state, argv) => {
  const wantsAll = argv
    .slice(1)
    .some((a) => a.includes('a') || a.includes('e'));
  const rows = state.processes.filter((p) => wantsAll || p.user === state.user);
  const header = 'USER       PID %CPU %MEM STAT COMMAND';
  const lines = rows.map(
    (p) =>
      `${p.user.padEnd(9)} ${pad(p.pid, 4)} ${pad(p.cpu.toFixed(1), 4)} ${pad(
        p.mem.toFixed(1),
        4,
      )} ${p.state.padEnd(4)} ${p.command}`,
  );
  return ok(state, [header, ...lines].join('\n'));
};

const top: Command = (state) => {
  const totalCpu = state.processes.reduce((sum, p) => sum + p.cpu, 0);
  const busiest = [...state.processes]
    .sort((a, b) => b.cpu - a.cpu)
    .slice(0, 8);
  return ok(
    state,
    [
      'top - 09:20:11 up 12 days,  3:41,  1 user,  load average: 0.42, 0.31, 0.28',
      `Tasks: ${state.processes.length} total,   1 running, ${state.processes.length - 1} sleeping`,
      `%Cpu(s): ${totalCpu.toFixed(1)} us,  1.2 sy, 97.0 id`,
      'MiB Mem :   3944.0 total,    812.4 free,   1620.9 used',
      '',
      '  PID USER      %CPU  %MEM COMMAND',
      ...busiest.map(
        (p) =>
          `${pad(p.pid, 5)} ${p.user.padEnd(9)} ${pad(p.cpu.toFixed(1), 4)} ${pad(
            p.mem.toFixed(1),
            5,
          )} ${p.command}`,
      ),
    ].join('\n'),
  );
};

const SIGNALS: Record<string, string> = {
  '1': 'HUP',
  '2': 'INT',
  '9': 'KILL',
  '15': 'TERM',
  HUP: 'HUP',
  INT: 'INT',
  KILL: 'KILL',
  TERM: 'TERM',
};

const stopServiceOwning = (state: ShellState, pid: number): void => {
  for (const service of Object.values(state.services)) {
    const owner = state.processes.find((p) => p.pid === pid);
    if (owner && service.active && owner.command.includes(service.name)) {
      service.active = false;
      service.log.push(`Main process exited, code=killed`);
      state.net.listening = state.net.listening.filter(
        (l) => l.port !== service.port,
      );
    }
  }
};

const kill: Command = (state, argv) => {
  const args = argv.slice(1);
  const signalArg = args.find((a) => a.startsWith('-'));
  const signal = signalArg ? SIGNALS[signalArg.replace(/^-+(s)?/, '')] : 'TERM';
  if (signalArg && !signal) {
    return fail(
      state,
      `kill: invalid signal specification '${signalArg.slice(1)}'`,
    );
  }
  const targets = args.filter((a) => !a.startsWith('-'));
  if (targets.length === 0)
    return fail(state, 'kill: usage: kill [-s sigspec] pid');

  for (const target of targets) {
    const pid = Number(target);
    const process = state.processes.find((p) => p.pid === pid);
    if (!process) return fail(state, `kill: (${target}) - No such process`);
    if (process.user !== state.user && state.user !== 'root') {
      return fail(state, `kill: (${target}) - Operation not permitted`);
    }
    // A well-behaved process ignores nothing but SIGKILL when it's wedged.
    if (signal === 'HUP') continue;
    stopServiceOwning(state, pid);
    state.processes = state.processes.filter((p) => p.pid !== pid);
  }
  return ok(state);
};

const killall: Command = (state, argv) => {
  const name = argv.filter((a, i) => i > 0 && !a.startsWith('-')).pop();
  if (!name) return fail(state, 'killall: missing operand');
  const victims = state.processes.filter((p) =>
    p.command.split(' ')[0].endsWith(name),
  );
  if (victims.length === 0) return fail(state, `${name}: no process found`);
  for (const victim of victims) stopServiceOwning(state, victim.pid);
  state.processes = state.processes.filter((p) => !victims.includes(p));
  return ok(state);
};

const pgrep: Command = (state, argv) => {
  const name = argv[1];
  if (!name) return fail(state, 'pgrep: no matching criteria specified');
  const hits = state.processes.filter((p) => p.command.includes(name));
  return hits.length === 0
    ? { state, stdout: '', stderr: '', code: 1 }
    : ok(state, hits.map((p) => String(p.pid)).join('\n'));
};

const startService = (state: ShellState, name: string): void => {
  const service = state.services[name];
  if (!service || service.active) return;
  service.active = true;
  service.log.push(`Started ${service.description}.`);
  state.processes.push({
    pid: state.nextPid,
    user: 'root',
    command: `/usr/sbin/${name}`,
    cpu: 0.4,
    mem: 1.8,
    state: 'S',
  });
  state.nextPid += 1;
  if (service.port !== undefined) {
    state.net.listening.push({
      port: service.port,
      proto: 'tcp',
      process: name,
      address: '0.0.0.0',
    });
  }
};

const stopService = (state: ShellState, name: string): void => {
  const service = state.services[name];
  if (!service) return;
  service.active = false;
  service.log.push(`Stopped ${service.description}.`);
  state.processes = state.processes.filter((p) => !p.command.includes(name));
  if (service.port !== undefined) {
    state.net.listening = state.net.listening.filter(
      (l) => l.port !== service.port,
    );
  }
};

const unitName = (raw: string): string => raw.replace(/\.service$/, '');

const systemctl: Command = (state, argv) => {
  const operands = argv.slice(1).filter((a) => !a.startsWith('-'));
  const action = operands[0];
  const name = operands[1] ? unitName(operands[1]) : null;

  if (!action || action === 'list-units' || action === 'list-unit-files') {
    const rows = Object.values(state.services).map(
      (s) =>
        `${`${s.name}.service`.padEnd(24)} ${(s.active ? 'active' : 'inactive').padEnd(10)} ${
          s.enabled ? 'enabled' : 'disabled'
        }`,
    );
    return ok(
      state,
      ['UNIT                     ACTIVE     ENABLED', ...rows].join('\n'),
    );
  }

  if (action === 'daemon-reload') return ok(state);

  if (!name) return fail(state, 'systemctl: too few arguments.');
  const service = state.services[name];
  if (!service) {
    return fail(state, `Unit ${name}.service could not be found.`, 4);
  }

  const mutating = ['start', 'stop', 'restart', 'reload', 'enable', 'disable'];
  if (mutating.includes(action) && state.user !== 'root') {
    return fail(
      state,
      `Failed to ${action} ${name}.service: Access denied\n(hint: run it with sudo)`,
    );
  }

  switch (action) {
    case 'status': {
      const dot = service.active ? '●' : '○';
      return {
        state,
        stdout: [
          `${dot} ${name}.service - ${service.description}`,
          `     Loaded: loaded (/lib/systemd/system/${name}.service; ${
            service.enabled ? 'enabled' : 'disabled'
          }; preset: enabled)`,
          `     Active: ${
            service.active
              ? 'active (running) since Fri 2031-03-14 09:12:03 UTC'
              : 'inactive (dead)'
          }`,
          service.port !== undefined
            ? `     Listen: 0.0.0.0:${service.port}`
            : '',
          '',
          ...service.log
            .slice(-5)
            .map(
              (line) => `Mar 14 09:12:03 ${state.hostname} ${name}[1]: ${line}`,
            ),
        ]
          .filter(Boolean)
          .join('\n'),
        stderr: '',
        code: service.active ? 0 : 3,
      };
    }
    case 'start':
      startService(state, name);
      return ok(state);
    case 'stop':
      stopService(state, name);
      return ok(state);
    case 'restart':
    case 'reload':
      stopService(state, name);
      startService(state, name);
      return ok(state);
    case 'enable':
      service.enabled = true;
      if (argv.includes('--now')) startService(state, name);
      return ok(
        state,
        `Created symlink /etc/systemd/system/multi-user.target.wants/${name}.service → /lib/systemd/system/${name}.service.`,
      );
    case 'disable':
      service.enabled = false;
      return ok(
        state,
        `Removed "/etc/systemd/system/multi-user.target.wants/${name}.service".`,
      );
    case 'is-active':
      return service.active
        ? ok(state, 'active')
        : { state, stdout: 'inactive', stderr: '', code: 3 };
    case 'is-enabled':
      return service.enabled
        ? ok(state, 'enabled')
        : { state, stdout: 'disabled', stderr: '', code: 1 };
    default:
      return fail(state, `Unknown command verb ${action}.`);
  }
};

const journalctl: Command = (state, argv) => {
  const unitIndex = argv.findIndex((a) => a === '-u' || a === '--unit');
  const countIndex = argv.findIndex((a) => a === '-n' || a === '--lines');
  const count = countIndex !== -1 ? Number(argv[countIndex + 1]) || 10 : 50;

  if (unitIndex === -1) {
    const all = Object.values(state.services).flatMap((s) =>
      s.log.map(
        (line) => `Mar 14 09:12:03 ${state.hostname} ${s.name}[1]: ${line}`,
      ),
    );
    return ok(state, all.slice(-count).join('\n'));
  }

  const name = unitName(argv[unitIndex + 1] ?? '');
  const service = state.services[name];
  if (!service) return fail(state, `Failed to add match: Invalid argument`);
  if (service.log.length === 0) return ok(state, '-- No entries --');
  return ok(
    state,
    service.log
      .slice(-count)
      .map((line) => `Mar 14 09:12:03 ${state.hostname} ${name}[1]: ${line}`)
      .join('\n'),
  );
};

const serviceCmd: Command = (state, argv) =>
  systemctl(state, ['systemctl', argv[2] ?? 'status', argv[1] ?? ''], '');

const uptime: Command = (state) =>
  ok(
    state,
    ' 09:20:11 up 12 days,  3:41,  1 user,  load average: 0.42, 0.31, 0.28',
  );

const free: Command = (state) =>
  ok(
    state,
    [
      '               total        used        free      shared  buff/cache   available',
      'Mem:            3944        1620         812          12        1511        2032',
      'Swap:              0           0           0',
    ].join('\n'),
  );

export const PROC_COMMANDS: Record<string, Command> = {
  ps,
  top,
  htop: top,
  kill,
  killall,
  pkill: killall,
  pgrep,
  systemctl,
  journalctl,
  service: serviceCmd,
  uptime,
  free,
};

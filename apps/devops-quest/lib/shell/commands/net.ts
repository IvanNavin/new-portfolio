import { readFile, resolvePath, writeFile } from '../fs';
import {
  type Command,
  fail,
  type HttpResponse,
  ok,
  type ShellState,
} from '../types';

const flagValue = (argv: string[], ...names: string[]): string | null => {
  for (const name of names) {
    const index = argv.indexOf(name);
    if (index !== -1 && index + 1 < argv.length) return argv[index + 1];
  }
  return null;
};

const ip: Command = (state, argv) => {
  const what = argv[1] ?? 'addr';
  if (what !== 'a' && what !== 'addr' && what !== 'address') {
    return fail(state, `Object "${what}" is unknown, try "ip help".`);
  }
  const lines = state.net.interfaces.flatMap((iface, index) => [
    `${index + 1}: ${iface.name}: <${iface.up ? 'UP,LOWER_UP' : 'DOWN'}> mtu 1500 state ${
      iface.up ? 'UP' : 'DOWN'
    }`,
    `    inet ${iface.ip}/${iface.prefix} scope ${iface.name === 'lo' ? 'host' : 'global'} ${iface.name}`,
  ]);
  return ok(state, lines.join('\n'));
};

const ss: Command = (state, argv) => {
  const flags = argv.slice(1).join('');
  const wantsListening =
    flags.includes('l') || flags.includes('t') || argv.length === 1;
  if (!wantsListening) return ok(state, '');
  const rows = [...state.net.listening]
    .sort((a, b) => a.port - b.port)
    .map(
      (entry) =>
        `${entry.proto.padEnd(6)} LISTEN 0      4096   ${`${entry.address}:${entry.port}`.padEnd(
          22,
        )} 0.0.0.0:*    users:(("${entry.process}",pid=1,fd=6))`,
    );
  return ok(
    state,
    [
      'Netid  State  Recv-Q Send-Q Local Address:Port      Peer Address:Port',
      ...rows,
    ].join('\n'),
  );
};

const resolveName = (state: ShellState, name: string): string | null => {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(name)) return name;
  if (state.net.hosts[name]) return state.net.hosts[name];
  const records = state.net.dns[name];
  if (!records) return null;
  const a = records.find((record) => record.type === 'A');
  if (a) return a.value;
  const cname = records.find((record) => record.type === 'CNAME');
  return cname ? resolveName(state, cname.value) : null;
};

const ping: Command = (state, argv) => {
  const host = argv.slice(1).find((a) => !a.startsWith('-'));
  if (!host)
    return fail(state, 'ping: usage error: Destination address required');
  const address = resolveName(state, host);
  if (!address) {
    return fail(state, `ping: ${host}: Name or service not known`, 2);
  }
  if (
    !state.net.reachable.includes(address) &&
    !state.net.reachable.includes(host)
  ) {
    return {
      state,
      stdout: [
        `PING ${host} (${address}) 56(84) bytes of data.`,
        '',
        `--- ${host} ping statistics ---`,
        '4 packets transmitted, 0 received, 100% packet loss, time 3070ms',
      ].join('\n'),
      stderr: '',
      code: 1,
    };
  }
  return ok(
    state,
    [
      `PING ${host} (${address}) 56(84) bytes of data.`,
      `64 bytes from ${address}: icmp_seq=1 ttl=64 time=0.412 ms`,
      `64 bytes from ${address}: icmp_seq=2 ttl=64 time=0.388 ms`,
      `64 bytes from ${address}: icmp_seq=3 ttl=64 time=0.401 ms`,
      '',
      `--- ${host} ping statistics ---`,
      '3 packets transmitted, 3 received, 0% packet loss, time 2031ms',
    ].join('\n'),
  );
};

const findRoute = (state: ShellState, url: string): HttpResponse | null => {
  const table = state.net.http;
  if (table[url]) return table[url];
  const withoutSlash = url.replace(/\/$/, '');
  if (table[withoutSlash]) return table[withoutSlash];
  if (table[`${withoutSlash}/`]) return table[`${withoutSlash}/`];
  return null;
};

const hostOf = (url: string): string => {
  const match = /^[a-z]+:\/\/([^/:]+)/.exec(url);
  return match ? match[1] : url.split('/')[0];
};

const curl: Command = (state, argv) => {
  const args = argv.slice(1);
  const target = args.find((a) => !a.startsWith('-') && !isFlagValue(args, a));
  if (!target)
    return fail(state, "curl: try 'curl --help' for more information", 2);

  const url = /^https?:\/\//.test(target) ? target : `http://${target}`;
  const headersOnly = args.includes('-I') || args.includes('--head');
  const showHeaders = args.includes('-i') || args.includes('--include');
  const method =
    flagValue(args, '-X', '--request') ?? (headersOnly ? 'HEAD' : 'GET');
  const outFile = flagValue(args, '-o', '--output');
  const follow = args.includes('-L') || args.includes('--location');

  const host = hostOf(url);
  if (!resolveName(state, host)) {
    return fail(state, `curl: (6) Could not resolve host: ${host}`, 6);
  }

  let response = findRoute(state, url);
  if (follow && response && response.status >= 300 && response.status < 400) {
    const location = response.headers.Location ?? response.headers.location;
    if (location) response = findRoute(state, location) ?? response;
  }

  if (!response) {
    const port = /^https:/.test(url) ? 443 : 80;
    const listening = state.net.listening.some((entry) => entry.port === port);
    return fail(
      state,
      listening
        ? `curl: (52) Empty reply from server`
        : `curl: (7) Failed to connect to ${host} port ${port}: Connection refused`,
      7,
    );
  }

  const headerBlock = [
    `HTTP/1.1 ${response.status} ${response.statusText}`,
    ...Object.entries(response.headers).map(
      ([key, value]) => `${key}: ${value}`,
    ),
    '',
  ].join('\n');

  const body = method === 'HEAD' ? '' : response.body;
  const output = headersOnly
    ? headerBlock
    : showHeaders
      ? `${headerBlock}\n${body}`
      : body;

  if (outFile) {
    writeFile(state.fs, resolvePath(state, outFile), output, state.user);
    return ok(state);
  }
  return ok(state, output);
};

/** True when `value` is being consumed as the argument of a preceding flag. */
const isFlagValue = (args: string[], value: string): boolean => {
  const index = args.indexOf(value);
  if (index <= 0) return false;
  return [
    '-X',
    '--request',
    '-H',
    '--header',
    '-d',
    '--data',
    '-o',
    '--output',
  ].includes(args[index - 1]);
};

const dig: Command = (state, argv) => {
  const args = argv.slice(1).filter((a) => !a.startsWith('+'));
  const short = argv.includes('+short');
  const typeArg = args.find((a) => /^(A|AAAA|CNAME|MX|TXT|NS)$/i.test(a));
  const name = args.find((a) => a !== typeArg);
  if (!name) return fail(state, ';; Missing name to look up');

  const type = (typeArg ?? 'A').toUpperCase();
  const records = (state.net.dns[name] ?? []).filter(
    (record) => record.type === type,
  );

  if (short) {
    return ok(state, records.map((record) => record.value).join('\n'));
  }

  const answers = records.map(
    (record) =>
      `${name}.\t\t${record.ttl}\tIN\t${record.type}\t${record.value}`,
  );
  return ok(
    state,
    [
      '; <<>> DiG 9.18.24 <<>> ' + name + ' ' + type,
      ';; global options: +cmd',
      ';; Got answer:',
      `;; ->>HEADER<<- opcode: QUERY, status: ${records.length > 0 ? 'NOERROR' : 'NXDOMAIN'}, id: 4211`,
      '',
      ';; QUESTION SECTION:',
      `;${name}.\t\t\tIN\t${type}`,
      '',
      ...(records.length > 0 ? [';; ANSWER SECTION:', ...answers, ''] : []),
      ';; Query time: 4 msec',
    ].join('\n'),
  );
};

const host: Command = (state, argv) => {
  const name = argv[1];
  if (!name) return fail(state, 'Usage: host [-t TYPE] name');
  const address = resolveName(state, name);
  return address
    ? ok(state, `${name} has address ${address}`)
    : fail(state, `Host ${name} not found: 3(NXDOMAIN)`, 1);
};

const ufw: Command = (state, argv) => {
  const action = argv[1];
  if (state.user !== 'root' && action !== 'status') {
    return fail(state, 'ERROR: You need to be root to run this script');
  }

  if (!action || action === 'status') {
    if (!state.net.firewall.enabled) return ok(state, 'Status: inactive');
    const rows = state.net.firewall.rules.map(
      (rule) =>
        `${`${rule.port}/${rule.proto}`.padEnd(24)} ${rule.action === 'allow' ? 'ALLOW' : 'DENY'}       Anywhere`,
    );
    return ok(
      state,
      [
        'Status: active',
        '',
        'To                         Action      From',
        '--                         ------      ----',
        ...rows,
      ].join('\n'),
    );
  }

  if (action === 'enable') {
    state.net.firewall.enabled = true;
    return ok(state, 'Firewall is active and enabled on system startup');
  }
  if (action === 'disable') {
    state.net.firewall.enabled = false;
    return ok(state, 'Firewall stopped and disabled on system startup');
  }

  if (action === 'allow' || action === 'deny') {
    const spec = argv[2];
    if (!spec) return fail(state, 'ERROR: Wrong number of arguments');
    const [portRaw, protoRaw] = spec.split('/');
    const named: Record<string, number> = { ssh: 22, http: 80, https: 443 };
    const port = named[portRaw] ?? Number(portRaw);
    if (!Number.isFinite(port))
      return fail(state, `ERROR: Could not find a profile matching '${spec}'`);
    const proto = protoRaw === 'udp' ? 'udp' : 'tcp';
    state.net.firewall.rules = [
      ...state.net.firewall.rules.filter(
        (rule) => !(rule.port === port && rule.proto === proto),
      ),
      { port, proto, action },
    ];
    return ok(state, 'Rules updated\nRules updated (v6)');
  }

  return fail(state, `ERROR: Invalid syntax`);
};

const netstat: Command = (state, argv) =>
  ss(state, ['ss', ...argv.slice(1)], '');

const wget: Command = (state, argv) => {
  const target = argv.slice(1).find((a) => !a.startsWith('-'));
  if (!target) return fail(state, 'wget: missing URL');
  return curl(
    state,
    ['curl', '-o', target.split('/').pop() ?? 'index.html', target],
    '',
  );
};

const nc: Command = (state, argv) => {
  const args = argv.slice(1).filter((a) => !a.startsWith('-'));
  const [target, portRaw] = args;
  const port = Number(portRaw);
  if (!target || !Number.isFinite(port))
    return fail(state, 'nc: usage: nc [-z] host port');
  const address = resolveName(state, target);
  if (!address)
    return fail(
      state,
      `nc: getaddrinfo for host "${target}" port ${port}: Name or service not known`,
    );
  const open = state.net.listening.some((entry) => entry.port === port);
  const blocked =
    state.net.firewall.enabled &&
    !state.net.firewall.rules.some(
      (rule) => rule.port === port && rule.action === 'allow',
    );
  return open && !blocked
    ? ok(state, `Connection to ${target} ${port} port [tcp/*] succeeded!`)
    : fail(
        state,
        `nc: connect to ${target} port ${port} (tcp) failed: Connection refused`,
        1,
      );
};

const hostsFile: Command = (state) =>
  ok(state, readFile(state.fs, '/etc/hosts') ?? '');

export const NET_COMMANDS: Record<string, Command> = {
  ip,
  ss,
  netstat,
  ping,
  curl,
  wget,
  dig,
  nslookup: dig,
  host,
  ufw,
  nc,
  getent: hostsFile,
};

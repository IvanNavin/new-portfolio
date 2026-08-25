import { readFile, resolvePath } from '../fs';
import {
  type Command,
  type DockerContainer,
  fail,
  ok,
  type ShellState,
} from '../types';

/** Deterministic 12-hex id, the way `docker ps` truncates them. */
const idFor = (seed: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  const a = hash.toString(16).padStart(8, '0');
  return (a + a).slice(0, 12);
};

/**
 * The daemon socket is root-owned; that is why a fresh user gets
 * "permission denied while trying to connect to the Docker daemon socket"
 * until someone adds them to the `docker` group. Reproducing that exactly is
 * half the lesson of the Docker level.
 */
const daemonDenied = (state: ShellState) =>
  fail(
    state,
    [
      'permission denied while trying to connect to the Docker daemon socket at',
      'unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.45/containers/json":',
      'dial unix /var/run/docker.sock: connect: permission denied',
    ].join('\n'),
    1,
  );

const canReachDaemon = (state: ShellState): boolean =>
  state.user === 'root' ||
  (state.users[state.user]?.groups ?? []).includes('docker');

const valueOf = (args: string[], ...names: string[]): string | null => {
  for (const name of names) {
    const index = args.indexOf(name);
    if (index !== -1 && index + 1 < args.length) return args[index + 1];
  }
  return null;
};

const splitImage = (raw: string): { repo: string; tag: string } => {
  const [repo, tag] = raw.includes(':') ? raw.split(':') : [raw, 'latest'];
  return { repo, tag };
};

const build: Command = (state, argv) => {
  const args = argv.slice(1);
  const tag = valueOf(args, '-t', '--tag');
  if (!tag)
    return fail(
      state,
      'ERROR: "docker build" requires a tag: use -t name:tag',
      1,
    );

  const contextPath = resolvePath(
    state,
    args[args.length - 1] === '.' ? '.' : args[args.length - 1],
  );
  const dockerfilePath =
    valueOf(args, '-f', '--file') ?? `${contextPath}/Dockerfile`;
  const dockerfile = readFile(state.fs, resolvePath(state, dockerfilePath));

  if (!dockerfile) {
    return fail(
      state,
      `ERROR: failed to solve: failed to read dockerfile: open ${dockerfilePath}: no such file or directory`,
      1,
    );
  }

  const instructions = dockerfile
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));

  if (!instructions.some((line) => /^FROM\s/i.test(line))) {
    return fail(
      state,
      'ERROR: failed to solve: dockerfile parse error: no FROM instruction found',
      1,
    );
  }

  const { repo, tag: version } = splitImage(tag);
  const output: string[] = ['[+] Building 3.2s (12/12) FINISHED'];

  instructions.forEach((line, index) => {
    const cached = state.docker.layerCache.includes(line);
    output.push(
      ` => ${cached ? 'CACHED ' : ''}[${index + 1}/${instructions.length}] ${line.slice(0, 60)}`,
    );
    if (!cached) state.docker.layerCache.push(line);
  });

  const id = idFor(tag + instructions.length);
  state.docker.images = [
    ...state.docker.images.filter(
      (image) => !(image.repo === repo && image.tag === version),
    ),
    { repo, tag: version, id, size: '124MB', created: 'now' },
  ];

  output.push(` => => naming to docker.io/library/${repo}:${version}`);
  return ok(state, output.join('\n'));
};

const run: Command = (state, argv) => {
  const args = argv.slice(1);
  const detached = args.includes('-d') || args.includes('--detach');
  const name = valueOf(args, '--name');
  const publish = args
    .map((arg, index) =>
      arg === '-p' || arg === '--publish' ? args[index + 1] : null,
    )
    .filter((each): each is string => each !== null);
  const envPairs = args
    .map((arg, index) =>
      arg === '-e' || arg === '--env' ? args[index + 1] : null,
    )
    .filter((each): each is string => each !== null);
  const volumes = args
    .map((arg, index) =>
      arg === '-v' || arg === '--volume' ? args[index + 1] : null,
    )
    .filter((each): each is string => each !== null);

  const consumed = new Set([
    '-p',
    '--publish',
    '-e',
    '--env',
    '-v',
    '--volume',
    '--name',
    '--network',
  ]);
  const imageRaw = args.find(
    (arg, index) =>
      !arg.startsWith('-') && !consumed.has(args[index - 1] ?? ''),
  );
  if (!imageRaw)
    return fail(state, 'docker: "run" requires at least 1 argument.', 1);

  const { repo, tag } = splitImage(imageRaw);
  const image = state.docker.images.find(
    (each) => each.repo === repo && each.tag === tag,
  );
  if (!image) {
    return fail(
      state,
      `Unable to find image '${repo}:${tag}' locally\ndocker: Error response from daemon: pull access denied for ${repo}.`,
      125,
    );
  }

  const containerName = name ?? `${repo}-${state.docker.containers.length + 1}`;
  if (state.docker.containers.some((each) => each.name === containerName)) {
    return fail(
      state,
      `docker: Error response from daemon: Conflict. The container name "/${containerName}" is already in use.`,
      125,
    );
  }

  for (const mapping of publish) {
    const hostPort = Number(mapping.split(':')[0]);
    if (state.net.listening.some((entry) => entry.port === hostPort)) {
      return fail(
        state,
        `docker: Error response from daemon: driver failed programming external connectivity: bind for 0.0.0.0:${hostPort} failed: port is already allocated.`,
        125,
      );
    }
  }

  const container: DockerContainer = {
    id: idFor(containerName),
    name: containerName,
    image: `${repo}:${tag}`,
    status: 'running',
    ports: publish,
    command: 'node server.js',
    logs: [`Server listening on port ${publish[0]?.split(':')[1] ?? '3000'}`],
    env: Object.fromEntries(
      envPairs.map((pair) => {
        const [key, ...rest] = pair.split('=');
        return [key, rest.join('=')];
      }),
    ),
    volumes,
    network: valueOf(args, '--network') ?? 'bridge',
  };

  state.docker.containers.push(container);
  for (const mapping of publish) {
    state.net.listening.push({
      port: Number(mapping.split(':')[0]),
      proto: 'tcp',
      process: `docker-proxy(${containerName})`,
      address: '0.0.0.0',
    });
  }

  return ok(state, detached ? container.id : container.logs.join('\n'));
};

const ps: Command = (state, argv) => {
  const all = argv.includes('-a') || argv.includes('--all');
  const rows = state.docker.containers
    .filter((each) => all || each.status === 'running')
    .map(
      (each) =>
        `${each.id}   ${each.image.padEnd(18)} "${each.command}"   ${
          each.status === 'running' ? 'Up 2 minutes' : 'Exited (0) 1 minute ago'
        }`.padEnd(80) + `${each.ports.join(', ').padEnd(24)} ${each.name}`,
    );
  return ok(
    state,
    [
      'CONTAINER ID   IMAGE              COMMAND             STATUS' +
        ' '.repeat(24) +
        'PORTS                    NAMES',
      ...rows,
    ].join('\n'),
  );
};

const images: Command = (state) =>
  ok(
    state,
    [
      'REPOSITORY          TAG       IMAGE ID       CREATED         SIZE',
      ...state.docker.images.map(
        (image) =>
          `${image.repo.padEnd(19)} ${image.tag.padEnd(9)} ${image.id} ${image.created.padEnd(15)} ${image.size}`,
      ),
    ].join('\n'),
  );

const findContainer = (state: ShellState, key: string) =>
  state.docker.containers.find(
    (each) => each.name === key || each.id.startsWith(key),
  );

const logs: Command = (state, argv) => {
  const key = argv.slice(1).find((a) => !a.startsWith('-'));
  if (!key) return fail(state, '"docker logs" requires exactly 1 argument.', 1);
  const container = findContainer(state, key);
  if (!container)
    return fail(
      state,
      `Error response from daemon: No such container: ${key}`,
      1,
    );
  return ok(state, container.logs.join('\n'));
};

const exec: Command = (state, argv) => {
  const args = argv.slice(1);
  const key = args.find((a) => !a.startsWith('-'));
  const container = key ? findContainer(state, key) : undefined;
  if (!container)
    return fail(
      state,
      `Error response from daemon: No such container: ${key}`,
      1,
    );
  if (container.status !== 'running') {
    return fail(
      state,
      `Error response from daemon: container ${container.name} is not running`,
      1,
    );
  }
  const rest = args.slice(args.indexOf(key ?? '') + 1);
  if (rest[0] === 'env') {
    return ok(
      state,
      Object.entries(container.env)
        .map(([name, value]) => `${name}=${value}`)
        .join('\n'),
    );
  }
  return ok(state, `# (усередині ${container.name}) ${rest.join(' ') || 'sh'}`);
};

const lifecycle =
  (action: 'stop' | 'start' | 'rm' | 'restart'): Command =>
  (state, argv) => {
    const keys = argv.slice(1).filter((a) => !a.startsWith('-'));
    if (keys.length === 0)
      return fail(state, `"docker ${action}" requires at least 1 argument.`, 1);

    for (const key of keys) {
      const container = findContainer(state, key);
      if (!container)
        return fail(
          state,
          `Error response from daemon: No such container: ${key}`,
          1,
        );

      if (action === 'stop' || action === 'restart') {
        container.status = 'exited';
        state.net.listening = state.net.listening.filter(
          (entry) => !entry.process.includes(`(${container.name})`),
        );
      }
      if (action === 'start' || action === 'restart') {
        container.status = 'running';
        for (const mapping of container.ports) {
          state.net.listening.push({
            port: Number(mapping.split(':')[0]),
            proto: 'tcp',
            process: `docker-proxy(${container.name})`,
            address: '0.0.0.0',
          });
        }
      }
      if (action === 'rm') {
        if (container.status === 'running') {
          return fail(
            state,
            `Error response from daemon: cannot remove container "${container.name}": container is running: stop it first`,
            1,
          );
        }
        state.docker.containers = state.docker.containers.filter(
          (each) => each !== container,
        );
      }
    }
    return ok(state, keys.join('\n'));
  };

const pull: Command = (state, argv) => {
  const raw = argv.slice(1).find((a) => !a.startsWith('-'));
  if (!raw) return fail(state, '"docker pull" requires exactly 1 argument.', 1);
  const { repo, tag } = splitImage(raw);
  state.docker.images.push({
    repo,
    tag,
    id: idFor(raw),
    size: '78.2MB',
    created: '2 weeks ago',
  });
  return ok(
    state,
    [
      `${tag}: Pulling from library/${repo}`,
      'Digest: sha256:aa12',
      `Status: Downloaded newer image for ${repo}:${tag}`,
    ].join('\n'),
  );
};

const compose: Command = (state, argv) => {
  const action = argv.slice(2).find((a) => !a.startsWith('-'));
  const yaml =
    readFile(state.fs, `${state.cwd}/docker-compose.yml`) ??
    readFile(state.fs, `${state.cwd}/compose.yaml`);

  if (!yaml) {
    return fail(state, 'no configuration file provided: not found', 1);
  }

  const services = yaml
    .split('\n')
    .filter((line) => /^ {2}\w[\w-]*:\s*$/.test(line))
    .map((line) => line.trim().replace(':', ''));

  if (action === 'down') {
    for (const service of services) {
      const container = findContainer(state, `shop-${service}`);
      if (container) container.status = 'exited';
    }
    state.net.listening = state.net.listening.filter(
      (entry) => !entry.process.includes('docker-proxy'),
    );
    return ok(
      state,
      services
        .map((service) => ` Container shop-${service}  Removed`)
        .join('\n'),
    );
  }

  if (action === 'ps') {
    return ps(state, ['ps'], '');
  }

  for (const service of services) {
    const name = `shop-${service}`;
    if (findContainer(state, name)) continue;
    state.docker.containers.push({
      id: idFor(name),
      name,
      image: `${service}:latest`,
      status: 'running',
      ports: [],
      command: service,
      logs: [`${service} started`],
      env: {},
      volumes: [],
      network: 'shop_default',
    });
  }
  if (!state.docker.networks.includes('shop_default'))
    state.docker.networks.push('shop_default');

  return ok(
    state,
    [
      ' Network shop_default  Created',
      ...services.map((service) => ` Container shop-${service}  Started`),
    ].join('\n'),
  );
};

const network: Command = (state, argv) => {
  const action = argv[2];
  if (action === 'ls' || !action) {
    return ok(
      state,
      [
        'NETWORK ID     NAME              DRIVER    SCOPE',
        ...state.docker.networks.map(
          (name) => `${idFor(name)}   ${name.padEnd(17)} bridge    local`,
        ),
      ].join('\n'),
    );
  }
  if (action === 'create') {
    const name = argv[3];
    if (!name)
      return fail(
        state,
        '"docker network create" requires exactly 1 argument.',
        1,
      );
    state.docker.networks.push(name);
    return ok(state, idFor(name));
  }
  return fail(state, `docker network: unknown command: ${action}`, 1);
};

const volume: Command = (state, argv) => {
  const action = argv[2];
  if (action === 'create') {
    const name = argv[3] ?? 'anonymous';
    state.docker.volumes.push(name);
    return ok(state, name);
  }
  return ok(
    state,
    [
      'DRIVER    VOLUME NAME',
      ...state.docker.volumes.map((name) => `local     ${name}`),
    ].join('\n'),
  );
};

const SUBCOMMANDS: Record<string, Command> = {
  build,
  run,
  ps,
  images,
  image: images,
  logs,
  exec,
  stop: lifecycle('stop'),
  start: lifecycle('start'),
  restart: lifecycle('restart'),
  rm: lifecycle('rm'),
  pull,
  compose,
  network,
  volume,
};

const docker: Command = (state, argv, stdin) => {
  if (!canReachDaemon(state)) return daemonDenied(state);

  const sub = argv[1];
  if (!sub) {
    return fail(
      state,
      [
        'Usage:  docker [OPTIONS] COMMAND',
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
      `docker: '${sub}' is not a docker command.\nSee 'docker --help'`,
      1,
    );
  }
  return handler(
    state,
    sub === 'compose' || sub === 'network' || sub === 'volume'
      ? argv
      : argv.slice(1),
    stdin,
  );
};

const dockerCompose: Command = (state, argv, stdin) =>
  canReachDaemon(state)
    ? compose(state, ['docker', 'compose', ...argv.slice(1)], stdin)
    : daemonDenied(state);

export const DOCKER_COMMANDS: Record<string, Command> = {
  docker,
  'docker-compose': dockerCompose,
};

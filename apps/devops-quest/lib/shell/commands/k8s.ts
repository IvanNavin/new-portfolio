import { readFile, resolvePath } from '../fs';
import { type Command, fail, type K8sPod, ok, type ShellState } from '../types';

/**
 * A deliberately small slice of kubectl: the verbs an engineer actually reaches
 * for during an incident (get / describe / logs / rollout undo) plus enough of
 * `apply` to make writing a manifest meaningful.
 */

const pad = (value: string, width: number) => value.padEnd(width);

/** Accepts both `--replicas 5` and `--replicas=5`, as kubectl does. */
const valueOf = (args: string[], ...names: string[]): string | null => {
  for (const name of names) {
    const index = args.indexOf(name);
    if (index !== -1 && index + 1 < args.length) return args[index + 1];
    const inline = args.find((arg) => arg.startsWith(`${name}=`));
    if (inline) return inline.slice(name.length + 1);
  }
  return null;
};

const NORMALISE: Record<string, string> = {
  po: 'pods',
  pod: 'pods',
  pods: 'pods',
  deploy: 'deployments',
  deployment: 'deployments',
  deployments: 'deployments',
  svc: 'services',
  service: 'services',
  services: 'services',
  cm: 'configmaps',
  configmap: 'configmaps',
  configmaps: 'configmaps',
  secret: 'secrets',
  secrets: 'secrets',
  ing: 'ingresses',
  ingress: 'ingresses',
  ingresses: 'ingresses',
  ns: 'namespaces',
  namespace: 'namespaces',
  namespaces: 'namespaces',
  node: 'nodes',
  nodes: 'nodes',
  all: 'all',
};

const podsTable = (pods: K8sPod[]): string =>
  [
    'NAME                                READY   STATUS             RESTARTS   AGE',
    ...pods.map(
      (pod) =>
        `${pad(pod.name, 35)} ${pad(pod.ready, 7)} ${pad(pod.status, 18)} ${pad(
          String(pod.restarts),
          10,
        )} ${pod.age}`,
    ),
  ].join('\n');

const get: Command = (state, argv) => {
  const args = argv.slice(1);
  const kindRaw = args.find((a) => !a.startsWith('-'));
  if (!kindRaw)
    return fail(
      state,
      'error: You must specify the type of resource to get.',
      1,
    );
  const kind = NORMALISE[kindRaw];
  if (!kind) {
    return fail(
      state,
      `error: the server doesn't have a resource type "${kindRaw}"`,
      1,
    );
  }

  const name = args.filter((a) => !a.startsWith('-'))[1];

  if (kind === 'pods' || kind === 'all') {
    const pods = name
      ? state.k8s.pods.filter((pod) => pod.name === name)
      : state.k8s.pods;
    if (name && pods.length === 0) {
      return fail(
        state,
        `Error from server (NotFound): pods "${name}" not found`,
        1,
      );
    }
    if (kind === 'pods') return ok(state, podsTable(pods));
  }

  if (kind === 'deployments' || kind === 'all') {
    const rows = [
      'NAME                 READY   UP-TO-DATE   AVAILABLE   AGE',
      ...state.k8s.deployments.map(
        (deployment) =>
          `${pad(deployment.name, 20)} ${pad(`${deployment.ready}/${deployment.replicas}`, 7)} ${pad(
            String(deployment.replicas),
            12,
          )} ${pad(String(deployment.ready), 11)} 4d`,
      ),
    ].join('\n');
    if (kind === 'deployments') return ok(state, rows);
    return ok(state, `${podsTable(state.k8s.pods)}\n\n${rows}`);
  }

  if (kind === 'services') {
    return ok(
      state,
      [
        'NAME             TYPE        CLUSTER-IP      PORT(S)        AGE',
        ...state.k8s.services.map(
          (service) =>
            `${pad(service.name, 16)} ${pad(service.type, 11)} ${pad(service.clusterIp, 15)} ${pad(
              service.ports,
              14,
            )} 4d`,
        ),
      ].join('\n'),
    );
  }

  if (kind === 'configmaps') {
    return ok(
      state,
      [
        'NAME               DATA   AGE',
        ...state.k8s.configmaps.map(
          (cm) =>
            `${pad(cm.name, 18)} ${pad(String(Object.keys(cm.data).length), 6)} 4d`,
        ),
      ].join('\n'),
    );
  }

  if (kind === 'secrets') {
    return ok(
      state,
      [
        'NAME               TYPE     DATA   AGE',
        ...state.k8s.secrets.map(
          (secret) =>
            `${pad(secret.name, 18)} Opaque   ${pad(String(secret.keys.length), 6)} 4d`,
        ),
      ].join('\n'),
    );
  }

  if (kind === 'ingresses') {
    return ok(
      state,
      [
        'NAME          HOSTS                ADDRESS     PORTS',
        ...state.k8s.ingresses.map(
          (ingress) =>
            `${pad(ingress.name, 13)} ${pad(ingress.host, 20)} 10.0.0.9    ${ingress.tls ? '80, 443' : '80'}`,
        ),
      ].join('\n'),
    );
  }

  if (kind === 'namespaces') {
    return ok(
      state,
      [
        'NAME              STATUS   AGE',
        ...state.k8s.namespaces.map((ns) => `${pad(ns, 17)} Active   9d`),
      ].join('\n'),
    );
  }

  return ok(
    state,
    [
      'NAME       STATUS   ROLES           VERSION',
      'node-01    Ready    control-plane   v1.30.2',
    ].join('\n'),
  );
};

const describe: Command = (state, argv) => {
  const args = argv.slice(1).filter((a) => !a.startsWith('-'));
  const kind = NORMALISE[args[0] ?? ''];
  const name = args[1];
  if (!kind || !name)
    return fail(state, 'error: you must specify a resource type and name', 1);

  if (kind === 'pods') {
    const pod = state.k8s.pods.find((each) => each.name === name);
    if (!pod)
      return fail(
        state,
        `Error from server (NotFound): pods "${name}" not found`,
        1,
      );
    return ok(
      state,
      [
        `Name:             ${pod.name}`,
        `Namespace:        ${state.k8s.namespace}`,
        `Node:             ${pod.node}`,
        `Status:           ${pod.status}`,
        `Restart Count:    ${pod.restarts}`,
        `Image:            ${pod.image}`,
        'Labels:           ' +
          Object.entries(pod.labels)
            .map(([key, value]) => `${key}=${value}`)
            .join(','),
        '',
        'Events:',
        '  Type     Reason     Age    Message',
        '  ----     ------     ----   -------',
        ...pod.events.map((event) => `  ${event}`),
      ].join('\n'),
    );
  }

  const deployment = state.k8s.deployments.find((each) => each.name === name);
  if (!deployment) {
    return fail(
      state,
      `Error from server (NotFound): deployments.apps "${name}" not found`,
      1,
    );
  }
  return ok(
    state,
    [
      `Name:               ${deployment.name}`,
      `Namespace:          ${state.k8s.namespace}`,
      `Replicas:           ${deployment.replicas} desired | ${deployment.ready} available`,
      `Image:              ${deployment.image}`,
      `Revision:           ${deployment.revision}`,
    ].join('\n'),
  );
};

const logs: Command = (state, argv) => {
  const args = argv.slice(1);
  const name = args.find((a) => !a.startsWith('-'));
  if (!name) return fail(state, 'error: expected a pod name', 1);
  const previous = args.includes('-p') || args.includes('--previous');

  const pod = state.k8s.pods.find(
    (each) => each.name === name || each.name.startsWith(name),
  );
  if (!pod)
    return fail(
      state,
      `Error from server (NotFound): pods "${name}" not found`,
      1,
    );
  if (pod.logs.length === 0) {
    return ok(
      state,
      previous
        ? 'Error from server: previous terminated container not found'
        : '',
    );
  }
  return ok(state, pod.logs.join('\n'));
};

const apply: Command = (state, argv) => {
  const path = valueOf(argv.slice(1), '-f', '--filename');
  if (!path) return fail(state, 'error: must specify one of -f', 1);

  const manifest = readFile(state.fs, resolvePath(state, path));
  if (!manifest) {
    return fail(state, `error: the path "${path}" does not exist`, 1);
  }

  const kindMatch = /^kind:\s*(\w+)/m.exec(manifest);
  const nameMatch = /^\s{2}name:\s*(\S+)/m.exec(manifest);
  if (!kindMatch || !nameMatch) {
    return fail(
      state,
      'error: unable to decode manifest: missing kind or metadata.name',
      1,
    );
  }

  const kind = kindMatch[1];
  const name = nameMatch[1];

  if (kind === 'Deployment') {
    const replicas = Number(/^\s*replicas:\s*(\d+)/m.exec(manifest)?.[1] ?? 1);
    const image = /^\s*image:\s*(\S+)/m.exec(manifest)?.[1] ?? 'nginx:latest';
    const existing = state.k8s.deployments.find((each) => each.name === name);

    if (existing) {
      existing.replicas = replicas;
      existing.ready = replicas;
      if (existing.image !== image) {
        existing.history.push({
          revision: existing.revision,
          image: existing.image,
        });
        existing.revision += 1;
        existing.image = image;
      }
      state.k8s.pods = state.k8s.pods.filter((pod) => pod.deployment !== name);
    } else {
      state.k8s.deployments.push({
        name,
        replicas,
        ready: replicas,
        image,
        revision: 1,
        history: [],
        labels: { app: name },
      });
    }

    for (let i = 0; i < replicas; i += 1) {
      state.k8s.pods.push({
        name: `${name}-${(7000 + i).toString(36)}-${(i + 11).toString(36)}${i}x`,
        deployment: name,
        ready: '1/1',
        status: 'Running',
        restarts: 0,
        age: '3s',
        image,
        node: 'node-01',
        labels: { app: name },
        logs: [`${name} listening on :8080`],
        events: [
          'Normal   Scheduled  3s     Successfully assigned pod to node-01',
        ],
      });
    }
    return ok(
      state,
      `deployment.apps/${name} ${existing ? 'configured' : 'created'}`,
    );
  }

  if (kind === 'Service') {
    const existing = state.k8s.services.find((each) => each.name === name);
    if (!existing) {
      state.k8s.services.push({
        name,
        type: /type:\s*(\w+)/.exec(manifest)?.[1] ?? 'ClusterIP',
        clusterIp: '10.96.0.42',
        ports: `${/port:\s*(\d+)/.exec(manifest)?.[1] ?? '80'}/TCP`,
        selector: name,
      });
    }
    return ok(state, `service/${name} ${existing ? 'configured' : 'created'}`);
  }

  if (kind === 'ConfigMap') {
    const existing = state.k8s.configmaps.find((each) => each.name === name);
    if (!existing) state.k8s.configmaps.push({ name, data: {} });
    return ok(
      state,
      `configmap/${name} ${existing ? 'configured' : 'created'}`,
    );
  }

  return ok(state, `${kind.toLowerCase()}/${name} created`);
};

const scale: Command = (state, argv) => {
  const args = argv.slice(1);
  const replicas = Number(valueOf(args, '--replicas') ?? NaN);
  const target = args.find(
    (a, index) =>
      !a.startsWith('-') &&
      a !== String(replicas) &&
      args[index - 1] !== '--replicas',
  );
  const name = target?.includes('/') ? target.split('/')[1] : target;

  if (!Number.isFinite(replicas))
    return fail(state, 'error: --replicas is required', 1);
  const deployment = state.k8s.deployments.find((each) => each.name === name);
  if (!deployment) {
    return fail(
      state,
      `Error from server (NotFound): deployments.apps "${name}" not found`,
      1,
    );
  }

  const app = deployment.name;
  deployment.replicas = replicas;
  deployment.ready = replicas;
  state.k8s.pods = state.k8s.pods.filter((pod) => pod.deployment !== app);
  for (let i = 0; i < replicas; i += 1) {
    state.k8s.pods.push({
      name: `${app}-${(8000 + i).toString(36)}-${i}zq`,
      deployment: app,
      ready: '1/1',
      status: 'Running',
      restarts: 0,
      age: '2s',
      image: deployment.image,
      node: 'node-01',
      labels: { app },
      logs: [`${app} listening on :8080`],
      events: [],
    });
  }
  return ok(state, `deployment.apps/${app} scaled`);
};

const rollout: Command = (state, argv) => {
  const args = argv.slice(1);
  const action = args[0];
  const target = args.find((a) => a.includes('/'));
  const name = target?.split('/')[1];
  const deployment = state.k8s.deployments.find((each) => each.name === name);

  if (!deployment) {
    return fail(
      state,
      `Error from server (NotFound): deployments.apps "${name}" not found`,
      1,
    );
  }

  if (action === 'status') {
    return ok(state, `deployment "${deployment.name}" successfully rolled out`);
  }
  if (action === 'history') {
    return ok(
      state,
      [
        `deployment.apps/${deployment.name}`,
        'REVISION  CHANGE-CAUSE',
        ...deployment.history.map(
          (entry) => `${entry.revision}         image ${entry.image}`,
        ),
        `${deployment.revision}         image ${deployment.image}`,
      ].join('\n'),
    );
  }
  if (action === 'undo') {
    const previous = deployment.history.pop();
    if (!previous)
      return fail(
        state,
        `error: no rollout history found for deployment "${deployment.name}"`,
        1,
      );
    deployment.image = previous.image;
    deployment.revision += 1;
    deployment.ready = deployment.replicas;
    for (const pod of state.k8s.pods.filter(
      (each) => each.deployment === deployment.name,
    )) {
      pod.image = previous.image;
      pod.status = 'Running';
      pod.ready = '1/1';
      pod.restarts = 0;
      pod.logs = [`${deployment.name} listening on :8080`];
    }
    return ok(state, `deployment.apps/${deployment.name} rolled back`);
  }
  if (action === 'restart') {
    return ok(state, `deployment.apps/${deployment.name} restarted`);
  }
  return fail(state, `error: unknown command "${action}"`, 1);
};

const remove: Command = (state, argv) => {
  const args = argv.slice(1).filter((a) => !a.startsWith('-'));
  const kind = NORMALISE[args[0] ?? ''];
  const name = args[1];
  if (kind === 'pods') {
    const pod = state.k8s.pods.find((each) => each.name === name);
    if (!pod)
      return fail(
        state,
        `Error from server (NotFound): pods "${name}" not found`,
        1,
      );
    state.k8s.pods = state.k8s.pods.filter((each) => each !== pod);
    // A pod owned by a Deployment comes straight back — that's the whole point.
    if (pod.deployment) {
      state.k8s.pods.push({
        ...pod,
        name: `${pod.deployment}-${pod.name.slice(-4)}r`,
        age: '1s',
        restarts: 0,
      });
    }
    return ok(state, `pod "${name}" deleted`);
  }
  if (kind === 'deployments') {
    state.k8s.deployments = state.k8s.deployments.filter(
      (each) => each.name !== name,
    );
    state.k8s.pods = state.k8s.pods.filter((pod) => pod.deployment !== name);
    return ok(state, `deployment.apps "${name}" deleted`);
  }
  return fail(state, 'error: resource type not supported here', 1);
};

const SUBCOMMANDS: Record<string, Command> = {
  get,
  describe,
  logs,
  apply,
  scale,
  rollout,
  delete: remove,
};

const kubectl: Command = (state, argv, stdin) => {
  const sub = argv[1];
  if (!sub) {
    return fail(
      state,
      [
        'kubectl controls the Kubernetes cluster manager.',
        '',
        `Доступні тут: ${Object.keys(SUBCOMMANDS).sort().join(', ')}`,
      ].join('\n'),
      1,
    );
  }
  const handler = SUBCOMMANDS[sub];
  if (!handler)
    return fail(state, `error: unknown command "${sub}" for "kubectl"`, 1);
  return handler(state, argv.slice(1), stdin);
};

export const K8S_COMMANDS: Record<string, Command> = { kubectl, k: kubectl };

/** Exposed so scenarios can build pods without duplicating the shape. */
export const makePod = (
  partial: Partial<K8sPod> & { name: string },
): K8sPod => ({
  deployment: null,
  ready: '1/1',
  status: 'Running',
  restarts: 0,
  age: '4d',
  image: 'shop-api:1.0.0',
  node: 'node-01',
  labels: {},
  logs: [],
  events: [],
  ...partial,
});

export const podsOf = (state: ShellState, deployment: string): K8sPod[] =>
  state.k8s.pods.filter((pod) => pod.deployment === deployment);

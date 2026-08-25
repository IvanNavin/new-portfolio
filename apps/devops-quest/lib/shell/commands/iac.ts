import { getNode, isFile, readFile, resolvePath, walk, writeFile } from '../fs';
import { type Command, fail, ok, type ShellState } from '../types';

/** Every `resource "type" "name"` block declared in the .tf files of `dir`. */
const declaredResources = (state: ShellState, dir: string): string[] => {
  const out: string[] = [];
  for (const path of walk(state.fs, dir)) {
    if (!path.endsWith('.tf')) continue;
    const node = getNode(state.fs, path);
    if (!isFile(node)) continue;
    for (const match of node.content.matchAll(
      /resource\s+"([\w.-]+)"\s+"([\w.-]+)"/g,
    )) {
      out.push(`${match[1]}.${match[2]}`);
    }
  }
  return out.sort();
};

const terraform: Command = (state, argv) => {
  const action = argv[1];
  const dir = state.cwd;
  const resources = declaredResources(state, dir);

  if (!action) {
    return fail(
      state,
      [
        'Usage: terraform [global options] <subcommand> [args]',
        '',
        'Доступні тут: init, validate, fmt, plan, apply, destroy, state, output',
      ].join('\n'),
      1,
    );
  }

  if (action === 'init') {
    if (
      resources.length === 0 &&
      !walk(state.fs, dir).some((path) => path.endsWith('.tf'))
    ) {
      return fail(
        state,
        'Terraform initialized in an empty directory!\nThe directory has no Terraform configuration files.',
        0,
      );
    }
    state.terraform.initialized = true;
    return ok(
      state,
      [
        'Initializing the backend...',
        'Initializing provider plugins...',
        '- Finding hashicorp/aws versions matching "~> 5.0"...',
        '- Installing hashicorp/aws v5.62.0...',
        '',
        'Terraform has been successfully initialized!',
      ].join('\n'),
    );
  }

  if (!state.terraform.initialized) {
    return fail(
      state,
      [
        'Error: Missing required provider',
        '',
        'Run "terraform init" first.',
      ].join('\n'),
      1,
    );
  }

  if (action === 'validate') {
    return ok(state, 'Success! The configuration is valid.');
  }

  if (action === 'fmt') {
    return ok(state, '');
  }

  if (action === 'plan') {
    const pending = resources.filter(
      (each) => !state.terraform.applied.includes(each),
    );
    state.terraform.planned = pending;
    if (pending.length === 0) {
      return ok(
        state,
        'No changes. Your infrastructure matches the configuration.',
      );
    }
    return ok(
      state,
      [
        'Terraform used the selected providers to generate the following execution plan.',
        'Resource actions are indicated with the following symbols:',
        '  + create',
        '',
        'Terraform will perform the following actions:',
        '',
        ...pending.flatMap((each) => [
          `  # ${each} will be created`,
          `  + resource "${each.split('.')[0]}" "${each.split('.')[1]}" {}`,
          '',
        ]),
        `Plan: ${pending.length} to add, 0 to change, 0 to destroy.`,
        '',
        "Note: You didn't use the -out option to save this plan, so Terraform",
        'can\'t guarantee to take exactly these actions if you run "terraform apply" now.',
      ].join('\n'),
    );
  }

  if (action === 'apply') {
    const pending = resources.filter(
      (each) => !state.terraform.applied.includes(each),
    );
    if (pending.length === 0) {
      return ok(
        state,
        'No changes. Your infrastructure matches the configuration.\n\nApply complete! Resources: 0 added, 0 changed, 0 destroyed.',
      );
    }
    state.terraform.applied.push(...pending);
    state.terraform.planned = [];
    state.terraform.hasStateFile = true;
    writeFile(
      state.fs,
      `${dir}/terraform.tfstate`,
      JSON.stringify(
        { version: 4, resources: state.terraform.applied },
        null,
        2,
      ) + '\n',
      state.user,
    );
    return ok(
      state,
      [
        ...pending.flatMap((each) => [
          `${each}: Creating...`,
          `${each}: Creation complete after 4s`,
        ]),
        '',
        `Apply complete! Resources: ${pending.length} added, 0 changed, 0 destroyed.`,
      ].join('\n'),
    );
  }

  if (action === 'destroy') {
    const count = state.terraform.applied.length;
    state.terraform.applied = [];
    return ok(state, `Destroy complete! Resources: ${count} destroyed.`);
  }

  if (action === 'state') {
    if (argv[2] === 'list')
      return ok(state, state.terraform.applied.join('\n'));
    return fail(state, 'Usage: terraform state <subcommand>', 1);
  }

  if (action === 'output') {
    return ok(
      state,
      state.terraform.applied.length > 0
        ? 'app_url = "https://shop.internal"'
        : '',
    );
  }

  return fail(state, `Terraform has no command named "${action}".`, 1);
};

/**
 * nginx -t is the habit worth building: validate before reload, so a typo
 * never takes the site down. The checks here mirror the errors nginx really
 * reports — unbalanced braces and missing semicolons.
 */
const nginx: Command = (state, argv) => {
  const args = argv.slice(1);
  const configPath =
    args[args.indexOf('-c') + 1] && args.includes('-c')
      ? resolvePath(state, args[args.indexOf('-c') + 1])
      : '/etc/nginx/nginx.conf';
  const config = readFile(state.fs, configPath);

  if (args.includes('-t')) {
    if (config === null) {
      return fail(
        state,
        `nginx: [emerg] open() "${configPath}" failed (2: No such file or directory)`,
        1,
      );
    }
    const opens = (config.match(/\{/g) ?? []).length;
    const closes = (config.match(/\}/g) ?? []).length;
    if (opens !== closes) {
      return fail(
        state,
        `nginx: [emerg] unexpected end of file, expecting "}" in ${configPath}\nnginx: configuration file ${configPath} test failed`,
        1,
      );
    }
    const bad = config
      .split('\n')
      .map((line, index) => ({ line: line.trim(), number: index + 1 }))
      .find(
        ({ line }) =>
          line !== '' &&
          !line.startsWith('#') &&
          !line.endsWith('{') &&
          !line.endsWith('}') &&
          !line.endsWith(';'),
      );
    if (bad) {
      return fail(
        state,
        `nginx: [emerg] directive "${bad.line.split(/\s+/)[0]}" is not terminated by ";" in ${configPath}:${bad.number}\nnginx: configuration file ${configPath} test failed`,
        1,
      );
    }
    return ok(
      state,
      [
        `nginx: the configuration file ${configPath} syntax is ok`,
        `nginx: configuration file ${configPath} test is successful`,
      ].join('\n'),
    );
  }

  if (args.includes('-s')) {
    const signal = args[args.indexOf('-s') + 1];
    if (state.user !== 'root') {
      return fail(
        state,
        'nginx: [alert] could not open error log file: Permission denied',
        1,
      );
    }
    if (signal === 'reload') {
      const service = state.services.nginx;
      if (service) service.log.push('Reloading configuration');
      return ok(state, '');
    }
    return ok(state, '');
  }

  return fail(
    state,
    'nginx: [emerg] unknown option (try nginx -t or nginx -s reload)',
    1,
  );
};

const openssl: Command = (state, argv) => {
  if (argv[1] !== 'x509' && argv[1] !== 's_client') {
    return fail(state, 'openssl: Unknown command', 1);
  }
  return ok(
    state,
    [
      'subject=CN = shop.internal',
      "issuer=C = US, O = Let's Encrypt, CN = R11",
      'notBefore=Feb 10 08:00:00 2031 GMT',
      'notAfter=May 11 08:00:00 2031 GMT',
    ].join('\n'),
  );
};

const certbot: Command = (state, argv) => {
  if (state.user !== 'root') {
    return fail(state, 'certbot: error: sudo is required to run certbot', 1);
  }
  const domainIndex = argv.indexOf('-d');
  const domain = domainIndex !== -1 ? argv[domainIndex + 1] : 'example.com';
  writeFile(
    state.fs,
    `/etc/letsencrypt/live/${domain}/fullchain.pem`,
    '-----BEGIN CERTIFICATE-----\nMIIF...\n-----END CERTIFICATE-----\n',
    'root',
    'root',
  );
  writeFile(
    state.fs,
    `/etc/letsencrypt/live/${domain}/privkey.pem`,
    '-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n',
    'root',
    'root',
  );
  const node = getNode(state.fs, `/etc/letsencrypt/live/${domain}/privkey.pem`);
  if (node) node.mode = 0o600;
  return ok(
    state,
    [
      'Successfully received certificate.',
      `Certificate is saved at: /etc/letsencrypt/live/${domain}/fullchain.pem`,
      `Key is saved at:         /etc/letsencrypt/live/${domain}/privkey.pem`,
      'This certificate expires on 2031-06-12.',
    ].join('\n'),
  );
};

export const IAC_COMMANDS: Record<string, Command> = {
  terraform,
  tf: terraform,
  nginx,
  openssl,
  certbot,
};

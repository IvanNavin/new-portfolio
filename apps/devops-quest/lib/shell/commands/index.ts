import { MANPAGES, renderManPage } from '../man';
import { type Command, fail, ok } from '../types';
import { CORE_COMMANDS } from './core';
import { DOCKER_COMMANDS } from './docker';
import { GIT_COMMANDS } from './git';
import { IAC_COMMANDS } from './iac';
import { K8S_COMMANDS } from './k8s';
import { NET_COMMANDS } from './net';
import { PERM_COMMANDS } from './perms';
import { PROC_COMMANDS } from './proc';
import { SSH_COMMANDS } from './ssh';

const man: Command = (state, argv) => {
  const name = argv[1];
  if (!name) return fail(state, 'What manual page do you want?');
  const page = MANPAGES[name];
  if (!page) return fail(state, `No manual entry for ${name}`, 16);
  return ok(state, renderManPage(page));
};

const help: Command = (state) =>
  ok(
    state,
    [
      'Доступні команди в цій сесії:',
      '',
      ...chunk(Object.keys(COMMANDS).sort(), 6).map((row) =>
        row.map((name) => name.padEnd(13)).join(''),
      ),
      '',
      'Довідка по команді:  man <команда>',
    ].join('\n'),
  );

const chunk = <T>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
};

/**
 * The command registry. Adding a command is one entry here plus the handler —
 * there is no plugin layer, no registration lifecycle, nothing to wire up.
 */
export const COMMANDS: Record<string, Command> = {
  ...CORE_COMMANDS,
  ...PERM_COMMANDS,
  ...PROC_COMMANDS,
  ...NET_COMMANDS,
  ...SSH_COMMANDS,
  ...GIT_COMMANDS,
  ...DOCKER_COMMANDS,
  ...K8S_COMMANDS,
  ...IAC_COMMANDS,
  man,
  help,
};

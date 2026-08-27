import { describe, expect, it } from 'vitest';

import { getNode, isFile, walk } from '../shell/fs';
import type { ShellState } from '../shell/types';
import { ALL_MISSIONS, LEVELS } from './registry';
import type { Mission, TheoryBlock } from './types';

/**
 * A task may only ask for something the player can actually find.
 *
 * Every goal that grades a literal answer states what it expects, so this
 * boots that mission's own machine and checks the answer is visible somewhere
 * on it — in a file, a process list, an open port, a pod's logs. If it isn't
 * there and isn't in the theory either, the only way to produce it is to guess.
 */

/** Everything a player could read on this machine by looking around. */
const everythingVisible = (state: ShellState): string => {
  const parts: string[] = [];

  for (const path of walk(state.fs, '/')) {
    parts.push(path);
    const node = getNode(state.fs, path);
    if (isFile(node)) parts.push(node.content);
  }

  for (const process of state.processes) {
    parts.push(`${process.pid} ${process.user} ${process.command}`);
  }

  for (const entry of state.net.listening) {
    parts.push(`${entry.address}:${entry.port} ${entry.process}`);
  }
  for (const iface of state.net.interfaces)
    parts.push(`${iface.name} ${iface.ip}`);
  for (const [name, records] of Object.entries(state.net.dns)) {
    parts.push(
      name,
      ...records.map((record) => `${record.type} ${record.value}`),
    );
  }
  for (const [url, response] of Object.entries(state.net.http)) {
    parts.push(
      url,
      String(response.status),
      response.statusText,
      response.body,
    );
  }

  for (const service of Object.values(state.services)) {
    parts.push(service.name, service.description, ...service.log);
  }

  for (const pod of state.k8s.pods) {
    parts.push(pod.name, pod.status, pod.image, ...pod.logs, ...pod.events);
  }
  for (const deployment of state.k8s.deployments) {
    parts.push(deployment.name, deployment.image);
  }

  for (const image of state.docker.images)
    parts.push(`${image.repo}:${image.tag}`);
  for (const container of state.docker.containers) {
    parts.push(container.name, container.image, ...container.logs);
  }

  for (const commit of state.git.commits)
    parts.push(commit.hash, commit.message);
  parts.push(
    ...Object.keys(state.git.branches),
    ...Object.keys(state.git.tags),
  );

  return parts.join('\n');
};

const theoryTextOf = (blocks: TheoryBlock[]): string =>
  blocks
    .map((block) => {
      switch (block.kind) {
        case 'text':
        case 'note':
          return block.text;
        case 'code':
          return block.lines.join('\n');
        case 'table':
          return block.rows
            .map(([term, description]) => `${term} ${description}`)
            .join('\n');
      }
    })
    .join('\n');

type Case = {
  id: string;
  goalId: string;
  expected: string;
  mission: Mission;
  /** Text the player sees around the task itself, not on the machine. */
  onScreen: string;
};

const cases: Case[] = [];
for (const level of LEVELS) {
  for (const mission of level.missions) {
    if (mission.task.kind !== 'terminal') continue;
    for (const goal of mission.task.goals) {
      if (goal.expected === undefined) continue;
      cases.push({
        id: mission.id,
        goalId: goal.id,
        expected: goal.expected,
        mission,
        // The terminal's opening lines and the goal's own wording are on
        // screen too — a task may legitimately name the words it accepts.
        onScreen: [
          ...(mission.task.intro ?? []),
          goal.label,
          goal.hintOnFail ?? '',
        ].join('\n'),
      });
    }
  }
}

describe('answers are findable, not guessable', () => {
  it.each(cases.map((each) => [`${each.id} · ${each.goalId}`, each] as const))(
    '%s expects something the machine actually shows',
    (_label, each) => {
      if (each.mission.task.kind !== 'terminal')
        throw new Error('not a terminal mission');
      const sources = [
        everythingVisible(each.mission.task.boot()),
        theoryTextOf(each.mission.theory),
        each.onScreen,
      ].join('\n');
      expect(
        sources.includes(each.expected),
        `«${each.expected}» appears nowhere the player can see it`,
      ).toBe(true);
    },
  );

  it('found the answer-grading goals to check', () => {
    expect(cases.length).toBeGreaterThanOrEqual(10);
  });
});

describe('editor missions name every file they expect', () => {
  /** Filenames and hostnames: a dot followed by letters, so 1.4.0 is not one. */
  const NAMED_FILES = /[A-Za-z0-9_][\w.-]*\.[A-Za-z]{2,5}\b/g;

  // l09-m02 asked for an nginx config pointing at fullchain.pem and
  // privkey.pem. The first was introduced two missions later; the second
  // appeared nowhere at all. Both were unguessable, and nothing caught it
  // because editor goals check text rather than a stated answer.
  it.each(
    ALL_MISSIONS.filter((mission) => mission.task.kind === 'editor').map(
      (mission) => [mission.id, mission] as const,
    ),
  )('%s gives every filename its solution uses', (_id, mission) => {
    if (mission.task.kind !== 'editor')
      throw new Error('not an editor mission');
    const given = [
      theoryTextOf(mission.theory),
      mission.task.starter,
      mission.task.filename,
      ...mission.task.goals.map(
        (goal) => `${goal.label} ${goal.hintOnFail ?? ''}`,
      ),
    ].join('\n');

    const needed = [...new Set(mission.solution.match(NAMED_FILES) ?? [])];
    const missing = needed.filter((name) => !given.includes(name));
    expect(missing).toEqual([]);
  });
});

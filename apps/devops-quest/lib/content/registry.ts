import { level01 } from './levels/01-terminal';
import { level02 } from './levels/02-permissions';
import { level03 } from './levels/03-processes';
import { level04 } from './levels/04-network';
import { level05 } from './levels/05-ssh';
import { level06 } from './levels/06-git';
import { level07 } from './levels/07-docker';
import { level08 } from './levels/08-cicd';
import { level09 } from './levels/09-proxy-secrets';
import { level10 } from './levels/10-observability';
import { level11 } from './levels/11-kubernetes';
import { level12 } from './levels/12-cloud-iac';
import type { Act, Level, Mission } from './types';

/**
 * The whole curriculum, in order. Adding a level is one import plus one entry
 * in LEVELS; adding a mission is one object inside that level's file.
 */
export const ACTS: Act[] = [
  { id: 1, title: 'Акт I — Основи', subtitle: 'Сервер, файли, права, процеси' },
  { id: 2, title: 'Акт II — Мережа й доступ', subtitle: 'DNS, HTTP, SSH, Git' },
  {
    id: 3,
    title: 'Акт III — Контейнери й доставка',
    subtitle: 'Docker, CI/CD, proxy, секрети',
  },
  { id: 4, title: 'Акт IV — Продакшн', subtitle: 'Логи, Kubernetes, хмара' },
];

export const LEVELS: Level[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
  level06,
  level07,
  level08,
  level09,
  level10,
  level11,
  level12,
];

export const ALL_MISSIONS: Mission[] = LEVELS.flatMap(
  (level) => level.missions,
);

export const TOTAL_XP = ALL_MISSIONS.reduce(
  (sum, mission) => sum + mission.xp,
  0,
);

export const MAX_STARS = ALL_MISSIONS.length * 3;

export const getLevel = (id: string): Level | undefined =>
  LEVELS.find((level) => level.id === id);

export const getMission = (id: string): Mission | undefined =>
  ALL_MISSIONS.find((mission) => mission.id === id);

export const getLevelOfMission = (missionId: string): Level | undefined =>
  LEVELS.find((level) =>
    level.missions.some((mission) => mission.id === missionId),
  );

export const levelsOfAct = (act: number): Level[] =>
  LEVELS.filter((level) => level.act === act);

/** The mission right after this one, walking across level boundaries. */
export const nextMission = (missionId: string): Mission | undefined => {
  const index = ALL_MISSIONS.findIndex((mission) => mission.id === missionId);
  return index === -1 ? undefined : ALL_MISSIONS[index + 1];
};

export const previousMission = (missionId: string): Mission | undefined => {
  const index = ALL_MISSIONS.findIndex((mission) => mission.id === missionId);
  return index <= 0 ? undefined : ALL_MISSIONS[index - 1];
};

export const goalCount = (mission: Mission): number => {
  switch (mission.task.kind) {
    case 'terminal':
    case 'editor':
      return mission.task.goals.length;
    default:
      return 1;
  }
};

/** The numbered steps a mission asks for, whatever kind of task it is. */
export const stepsOf = (mission: Mission): string[] => {
  switch (mission.task.kind) {
    case 'terminal':
    case 'editor':
      return mission.task.goals.map((goal) => goal.label);
    case 'quiz':
      return [mission.task.question];
    case 'order':
      return [mission.task.instruction];
  }
};

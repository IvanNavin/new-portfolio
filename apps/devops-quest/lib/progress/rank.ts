export type Rank = {
  title: string;
  minXp: number;
  blurb: string;
};

/**
 * Ranks are spaced so the last one lands near a full clear of all 12 levels —
 * reaching Principal should mean you actually finished the curriculum.
 */
export const RANKS: Rank[] = [
  {
    title: 'Intern',
    minXp: 0,
    blurb: 'Тобі щойно видали доступ. Нічого не зламай.',
  },
  {
    title: 'Junior',
    minXp: 500,
    blurb: 'Ти вже знаходиш дорогу в терміналі без карти.',
  },
  {
    title: 'Middle',
    minXp: 1600,
    blurb: 'Права, процеси й мережа більше не лякають.',
  },
  {
    title: 'Senior',
    minXp: 3200,
    blurb: 'Ти доставляєш код у прод і розумієш, як він туди їде.',
  },
  {
    title: 'SRE',
    minXp: 5200,
    blurb: 'Тебе будять о 3:00, і ти знаєш, куди дивитись.',
  },
  {
    title: 'Principal',
    minXp: 7400,
    blurb: 'Ти проєктуєш інфраструктуру, а не гасиш її.',
  },
];

export const rankFor = (xp: number): Rank =>
  [...RANKS].reverse().find((rank) => xp >= rank.minXp) ?? RANKS[0];

export const nextRank = (xp: number): Rank | null =>
  RANKS.find((rank) => rank.minXp > xp) ?? null;

/** 0..1 progress towards the next rank; 1 when already at the top. */
export const rankProgress = (xp: number): number => {
  const current = rankFor(xp);
  const next = nextRank(xp);
  if (!next) return 1;
  return (xp - current.minXp) / (next.minXp - current.minXp);
};

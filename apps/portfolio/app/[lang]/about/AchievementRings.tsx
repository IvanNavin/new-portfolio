'use client';
import { AnimatedRing, type Ring } from './AnimatedRing';

export type { Ring };

type Props = {
  rings: Ring[];
};

export const AchievementRings = ({ rings }: Props) => (
  <section
    className='mx-auto my-10 grid max-w-[640px] grid-cols-2 gap-6 sm:grid-cols-4'
    aria-label='Career achievements'
  >
    {rings.map((ring, i) => (
      <AnimatedRing key={ring.label} ring={ring} delay={i * 120} />
    ))}
  </section>
);

'use client';
import { roboto } from '@assets/fonts';
import { clsxm } from '@repo/utils';

import { AnimatedRing, type Ring } from './AnimatedRing';

// Real-world Lighthouse scores measured against
// https://holovko-ivan.vercel.app. Replace these with the latest
// numbers each time you re-run Lighthouse so the rings don't lie.
// Last run: 2026-05-24 (desktop, devtools).
const SCORES: Ring[] = [
  {
    label: 'Performance',
    value: 97,
    max: 100,
    numberClass: 'text-green-400',
    stroke: '#4ade80',
  },
  {
    label: 'Accessibility',
    value: 100,
    max: 100,
    numberClass: 'text-green-400',
    stroke: '#4ade80',
  },
  {
    label: 'Best Practices',
    value: 96,
    max: 100,
    numberClass: 'text-green-400',
    stroke: '#4ade80',
  },
  {
    label: 'SEO',
    value: 100,
    max: 100,
    numberClass: 'text-green-400',
    stroke: '#4ade80',
  },
];

const PAGESPEED_URL =
  'https://pagespeed.web.dev/analysis?url=https://holovko-ivan.vercel.app';

type Props = {
  title: string;
  subtitle: string;
};

export const PerformanceRings = ({ title, subtitle }: Props) => (
  <section
    aria-label='Live Lighthouse performance scores for this site'
    className='mx-auto my-10 flex max-w-[640px] flex-col items-center'
  >
    <h2
      className={clsxm(
        roboto.className,
        'text-center text-lg font-semibold uppercase tracking-widest text-white/80',
      )}
    >
      {title}
    </h2>
    <p
      className={clsxm(
        roboto.className,
        'mb-6 mt-2 text-center text-xs text-white/50',
      )}
    >
      {subtitle}
    </p>
    <a
      href={PAGESPEED_URL}
      target='_blank'
      rel='noopener noreferrer'
      title='View live Lighthouse report on PageSpeed Insights'
      className='group grid w-full grid-cols-2 gap-6 transition-opacity duration-300 hover:opacity-100 sm:grid-cols-4'
    >
      {SCORES.map((ring, i) => (
        <AnimatedRing key={ring.label} ring={ring} delay={i * 120} />
      ))}
    </a>
  </section>
);

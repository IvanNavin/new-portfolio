'use client';
import { roboto } from '@assets/fonts';
import { Magnetic } from '@components/Magnetic';
import { clsxm } from '@repo/utils';
import type { TFunction } from 'i18next';

import { AnimatedRing, type Ring } from './AnimatedRing';

// Real-world Lighthouse scores measured against
// https://holovko-ivan.vercel.app. Replace these numbers each time you
// re-run Lighthouse so the rings don't lie. Labels come from i18n so
// the section translates with the rest of the page.
// Last run: 2026-05-24 (desktop, devtools).
const buildScores = (t: TFunction): Ring[] => [
  {
    label: t('about.lighthouse.perf'),
    value: 97,
    max: 100,
    numberClass: 'text-green-400',
    stroke: '#4ade80',
  },
  {
    label: t('about.lighthouse.a11y'),
    value: 100,
    max: 100,
    numberClass: 'text-green-400',
    stroke: '#4ade80',
  },
  {
    label: t('about.lighthouse.bestPractices'),
    value: 96,
    max: 100,
    numberClass: 'text-green-400',
    stroke: '#4ade80',
  },
  {
    label: t('about.lighthouse.seo'),
    value: 100,
    max: 100,
    numberClass: 'text-green-400',
    stroke: '#4ade80',
  },
];

const PAGESPEED_URL =
  'https://pagespeed.web.dev/analysis?url=https://holovko-ivan.vercel.app';

type Props = {
  t: TFunction;
  title: string;
  subtitle: string;
};

export const PerformanceRings = ({ t, title, subtitle }: Props) => {
  const scores = buildScores(t);
  return (
    <section
      aria-label={t('about.lighthouse.ariaLabel')}
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
        title={t('about.lighthouse.linkTitle')}
        className='group grid w-full grid-cols-2 gap-6 transition-opacity duration-300 hover:opacity-100 sm:grid-cols-4'
      >
        {scores.map((ring, i) => (
          <Magnetic key={ring.label}>
            {/* Wrapper div is the target of Magnetic's gsap translate. */}
            <div className='flex items-center justify-center'>
              <AnimatedRing ring={ring} delay={i * 120} />
            </div>
          </Magnetic>
        ))}
      </a>
    </section>
  );
};

import { clsxm } from '@repo/utils';

// Real-world Lighthouse scores measured against
// https://holovko-ivan.vercel.app. Replace these with the latest
// numbers each time you re-run Lighthouse so the badge doesn't lie.
const SCORES = {
  performance: 100,
  accessibility: 100,
  bestPractices: 100,
  seo: 100,
};

const colorFor = (score: number) => {
  if (score >= 90) return 'text-green-400 border-green-400/40';
  if (score >= 50) return 'text-yellow-400 border-yellow-400/40';
  return 'text-red-400 border-red-400/40';
};

type ScoreItemProps = {
  label: string;
  score: number;
};

const ScoreItem = ({ label, score }: ScoreItemProps) => (
  <div
    className={clsxm(
      'flex flex-col items-center justify-center gap-1 px-3 py-2',
      'rounded-full border bg-black/40 backdrop-blur-sm',
      colorFor(score),
    )}
    title={`Lighthouse ${label}: ${score}/100`}
  >
    <span className='text-[10px] uppercase tracking-wider opacity-70'>
      {label}
    </span>
    <span className='text-base font-bold leading-none'>{score}</span>
  </div>
);

type Props = {
  className?: string;
};

export const LighthouseBadge = ({ className }: Props) => (
  <a
    href='https://pagespeed.web.dev/analysis?url=https://holovko-ivan.vercel.app'
    target='_blank'
    rel='noopener noreferrer'
    className={clsxm(
      'group inline-flex items-center gap-1',
      'transition-opacity duration-300 hover:opacity-100 opacity-70',
      className,
    )}
    aria-label='View live Lighthouse report on PageSpeed Insights'
  >
    <ScoreItem label='Perf' score={SCORES.performance} />
    <ScoreItem label='A11y' score={SCORES.accessibility} />
    <ScoreItem label='Best' score={SCORES.bestPractices} />
    <ScoreItem label='SEO' score={SCORES.seo} />
  </a>
);

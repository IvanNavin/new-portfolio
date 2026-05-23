'use client';
import { roboto, russoOne } from '@assets/fonts';
import { clsxm } from '@repo/utils';

export type CareerEntry = {
  company: string;
  companySubtitle?: string;
  role: string;
  period: string;
  location?: string;
  workMode?: 'Remote' | 'On-site' | 'Hybrid';
  bullets: string[];
  stack?: string[];
  isCurrent?: boolean;
  /** Optional path or URL to a real logo image. If omitted, initials avatar is rendered. */
  logoUrl?: string;
  /** Optional tailwind gradient class pair (e.g. "from-red-500/80 to-orange-500/80"). */
  avatarGradient?: string;
};

type Props = {
  title: string;
  entries: CareerEntry[];
};

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span
    className={clsxm(
      'inline-flex items-center rounded-full border border-white/15 bg-white/5',
      'px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/70',
    )}
  >
    {children}
  </span>
);

const StackPill = ({ children }: { children: React.ReactNode }) => (
  <span
    className={clsxm(
      'inline-flex items-center rounded-md border border-yellow-400/20 bg-yellow-400/5',
      'px-2 py-0.5 text-xs text-yellow-100/80',
    )}
  >
    {children}
  </span>
);

const computeInitials = (company: string): string =>
  company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

const CompanyAvatar = ({
  company,
  logoUrl,
  gradient,
}: {
  company: string;
  logoUrl?: string;
  gradient?: string;
}) => {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${company} logo`}
        className='size-10 shrink-0 rounded-full bg-white/5 object-contain p-1'
      />
    );
  }
  return (
    <div
      aria-hidden='true'
      className={clsxm(
        'flex size-10 shrink-0 items-center justify-center rounded-full',
        'text-sm font-bold text-white shadow-inner ring-1 ring-white/10',
        'bg-gradient-to-br',
        gradient ?? 'from-slate-500/80 to-slate-700/80',
        russoOne.className,
      )}
    >
      {computeInitials(company)}
    </div>
  );
};

export const CareerTimeline = ({ title, entries }: Props) => (
  <section className='my-12' aria-label='Career timeline'>
    <h2 className={clsxm(russoOne.className, 'mb-8 text-[28px]')}>{title}</h2>
    <ol className='relative ml-4 border-l border-white/20 pl-6'>
      {entries.map((entry, i) => (
        <li key={`${entry.company}-${i}`} className='relative mb-10 last:mb-0'>
          <span
            aria-hidden='true'
            className={clsxm(
              'absolute -left-[31px] top-2 size-3 rounded-full',
              entry.isCurrent
                ? 'animate-pulse bg-yellow-300 shadow-[0_0_14px_rgba(253,224,71,0.9)]'
                : 'bg-yellow-400/80 shadow-[0_0_10px_rgba(250,204,21,0.6)]',
            )}
          />
          <div className='flex items-start gap-3'>
            <CompanyAvatar
              company={entry.company}
              logoUrl={entry.logoUrl}
              gradient={entry.avatarGradient}
            />
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                <p className='text-xs uppercase tracking-wider text-white/50'>
                  {entry.period}
                </p>
                {entry.isCurrent && (
                  <span
                    className={clsxm(
                      'rounded-full bg-yellow-300/15 px-2 py-0.5 text-[10px]',
                      'font-semibold uppercase tracking-wider text-yellow-200',
                    )}
                  >
                    Now
                  </span>
                )}
              </div>
              <p
                className={clsxm(
                  'mt-1 text-lg font-semibold text-white',
                  roboto.className,
                )}
              >
                {entry.role}
                {entry.company && (
                  <>
                    {' · '}
                    <span className='text-yellow-300'>{entry.company}</span>
                  </>
                )}
              </p>
              {(entry.companySubtitle || entry.location || entry.workMode) && (
                <div
                  className={clsxm(
                    'mt-1.5 flex flex-wrap items-center gap-2',
                    roboto.className,
                  )}
                >
                  {entry.companySubtitle && (
                    <span className='text-xs italic text-white/60'>
                      {entry.companySubtitle}
                    </span>
                  )}
                  {entry.location && <Chip>{entry.location}</Chip>}
                  {entry.workMode && <Chip>{entry.workMode}</Chip>}
                </div>
              )}
              {entry.bullets.length > 0 && (
                <ul
                  className={clsxm(
                    'mt-3 list-disc space-y-1 pl-5 text-sm text-white/80',
                    roboto.className,
                  )}
                >
                  {entry.bullets.map((bullet, j) => (
                    <li key={j}>{bullet}</li>
                  ))}
                </ul>
              )}
              {entry.stack && entry.stack.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-1.5'>
                  {entry.stack.map((tech) => (
                    <StackPill key={tech}>{tech}</StackPill>
                  ))}
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

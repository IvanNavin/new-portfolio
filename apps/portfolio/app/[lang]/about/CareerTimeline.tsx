'use client';
import { roboto, russoOne } from '@assets/fonts';
import { clsxm } from '@repo/utils';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export type CareerEntry = {
  company: string;
  companySubtitle?: string;
  role: string;
  period: string;
  location?: string;
  /** Free-form translated label (Remote / Віддалено / Vor Ort / ...). */
  workMode?: string;
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
  /** Translated label for the "Now" badge on the current entry. */
  nowLabel: string;
  /** aria-label for the surrounding <section>. */
  ariaLabel: string;
  entries: CareerEntry[];
};

// Visual size of the morphing blob in px. Kept as a constant so the
// translateY offset can center it on the scroll-driven position
// without measuring at runtime.
const BLOB_SIZE = 56;

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

/**
 * Dark-matter "blob" that rides the leading edge of the timeline
 * progress fill. The organic morph is pure CSS `border-radius`
 * interpolation (see `.timeline-blob` in style.css) — that's
 * GPU-accelerated and doesn't cost a frame of scroll smoothness,
 * which the previous SVG feTurbulence + feDisplacementMap approach
 * did. Initials sit on top in a sharp DOM layer.
 */
const MorphingBlob = ({ initials }: { initials: string }) => (
  <div
    className='pointer-events-none relative'
    style={{ width: BLOB_SIZE, height: BLOB_SIZE }}
  >
    {/* Soft white outer halo behind everything else. */}
    <div
      aria-hidden='true'
      className='absolute -inset-3 rounded-full bg-white/15 blur-xl'
    />
    {/* Dark-matter body: deep slate fill with only soft outer glow —
        no hard border, so the silhouette reads as an ephemeral dark
        mass you "see" by the light it bends around it, not by an
        outline. The `timeline-blob` class drives the animated
        border-radius morph. */}
    <div
      aria-hidden='true'
      className={clsxm(
        'timeline-blob absolute inset-0',
        'bg-slate-950',
        'shadow-[0_0_28px_rgba(255,255,255,0.35),inset_0_2px_8px_rgba(255,255,255,0.08)]',
      )}
    />
    {/* Initials sit OVER the morphing blob — sharp DOM layer outside any
        CSS animation so the text stays perfectly readable while the
        dark body underneath breathes. */}
    <AnimatePresence mode='wait'>
      <motion.div
        key={initials}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className={clsxm(
          'absolute inset-0 flex items-center justify-center',
          'text-sm font-bold tracking-wide text-white',
          'drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
          russoOne.className,
        )}
      >
        {initials}
      </motion.div>
    </AnimatePresence>
  </div>
);

export const CareerTimeline = ({
  title,
  nowLabel,
  ariaLabel,
  entries,
}: Props) => {
  const ref = useRef<HTMLOListElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  // Track the timeline's height so we can drive the blob via `y`
  // (transform — GPU-accelerated, scroll-friendly) instead of `top`
  // (which triggers layout on every change and was the main source
  // of scroll stutter).
  const [olHeight, setOlHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setOlHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 30%'],
  });
  const fillHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  // Map scroll progress to pixel offset along the timeline, with the
  // blob's center landing on the leading edge of the fill (hence the
  // -BLOB_SIZE/2 offset baked in here instead of an extra translate).
  const blobY = useTransform(
    scrollYProgress,
    [0, 1],
    [-BLOB_SIZE / 2, olHeight - BLOB_SIZE / 2],
  );
  // Fade the leading blob in/out at the edges so it doesn't pop at y=0
  // or hang off the bottom once the timeline has scrolled past.
  const blobOpacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.96, 1],
    [0, 1, 1, 0],
  );

  // Map progress to active entry index — partitioned uniformly across
  // [0, 1] so each entry "owns" 1/N of the timeline.
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const idx = Math.min(
      entries.length - 1,
      Math.max(0, Math.floor(latest * entries.length)),
    );
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  });

  const activeEntry = entries[activeIndex];

  return (
    <section className='my-12' aria-label={ariaLabel}>
      <h2
        className={clsxm(
          russoOne.className,
          'mb-8 text-[28px] tracking-wide text-white',
        )}
      >
        {title}
      </h2>
      <ol
        ref={ref}
        className='relative ml-2 border-l-[2px] border-white/15 pl-10'
      >
        {!prefersReducedMotion && (
          <>
            {/* Progress fill: vivid 2px line over the muted static border. */}
            <motion.div
              aria-hidden='true'
              style={{ height: fillHeight }}
              className={clsxm(
                'pointer-events-none absolute -left-[2px] top-0 w-[2px] rounded-full',
                'bg-gradient-to-b from-yellow-200 via-amber-300 to-orange-400',
                'shadow-[0_0_12px_rgba(253,224,71,0.4)]',
              )}
            />
            {/* Dark-matter blob riding the leading edge. Position via
                transform (`y`) keeps the scroll silky. */}
            <motion.div
              style={{
                y: blobY,
                opacity: blobOpacity,
                left: -BLOB_SIZE / 2,
              }}
              className='pointer-events-none absolute top-0 will-change-transform'
            >
              <MorphingBlob initials={computeInitials(activeEntry.company)} />
            </motion.div>
          </>
        )}
        {entries.map((entry, i) => {
          const isActive = !prefersReducedMotion && activeIndex === i;
          return (
            <motion.li
              key={`${entry.company}-${i}`}
              initial={prefersReducedMotion ? false : { opacity: 0, x: 16 }}
              whileInView={
                prefersReducedMotion ? undefined : { opacity: 1, x: 0 }
              }
              viewport={{ once: true, margin: '-80px 0px' }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              className='relative mb-8 last:mb-0'
            >
              {/* No per-entry bullet dot on the line: the moving blob is
                  THE indicator of which entry is active, and the active
                  card highlights itself with a yellow border + glow.
                  Static dots only added visual noise. */}
              {/* Glass card. No hover effect — instead the card highlights
                  when the scroll-driven `activeIndex` lands on it. */}
              <div
                className={clsxm(
                  'rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300',
                  isActive
                    ? 'border-yellow-300/40 bg-white/[0.08] -translate-y-0.5 shadow-[0_8px_36px_rgba(253,224,71,0.18)]'
                    : 'border-white/10 bg-white/[0.04]',
                )}
              >
                <div className='flex flex-wrap items-center gap-2'>
                  <span
                    className={clsxm(
                      'inline-block rounded-md bg-yellow-300/10 px-2 py-1',
                      'text-[11px] font-semibold uppercase tracking-wider text-yellow-200/90',
                      'ring-1 ring-yellow-300/20',
                    )}
                  >
                    {entry.period}
                  </span>
                  {entry.isCurrent && (
                    <span
                      className={clsxm(
                        'rounded-full bg-yellow-300/20 px-2 py-0.5 text-[10px]',
                        'font-bold uppercase tracking-wider text-yellow-100',
                        'shadow-[0_0_12px_rgba(253,224,71,0.5)]',
                      )}
                    >
                      {nowLabel}
                    </span>
                  )}
                </div>
                <p
                  className={clsxm(
                    'mt-2 text-lg font-semibold text-white',
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
                {(entry.companySubtitle ||
                  entry.location ||
                  entry.workMode) && (
                  <div
                    className={clsxm(
                      'mt-2 flex flex-wrap items-center gap-2',
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
                      'mt-3 space-y-1.5 text-sm text-white/75',
                      roboto.className,
                    )}
                  >
                    {entry.bullets.map((bullet, j) => (
                      <li key={j} className='flex gap-2'>
                        <span
                          aria-hidden='true'
                          className='mt-[7px] inline-block size-1 shrink-0 rounded-full bg-yellow-400/70'
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {entry.stack && entry.stack.length > 0 && (
                  <div className='mt-4 flex flex-wrap gap-1.5'>
                    {entry.stack.map((tech) => (
                      <StackPill key={tech}>{tech}</StackPill>
                    ))}
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
};

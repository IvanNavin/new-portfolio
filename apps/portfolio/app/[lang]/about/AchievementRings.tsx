'use client';
import { roboto } from '@assets/fonts';
import { clsxm } from '@repo/utils';
import { useEffect, useState } from 'react';

export type Ring = {
  label: string;
  value: number;
  /** Maximum value the ring's stroke fills against. */
  max: number;
  /** Suffix rendered after the count (e.g. "+"). */
  suffix?: string;
  /** Tailwind text color class for the big number. */
  numberClass: string;
  /** Stroke color used by the SVG arc. */
  stroke: string;
};

type Props = {
  rings: Ring[];
};

const SIZE = 132;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const FILL_DURATION = 1400;

const AnimatedRing = ({ ring, delay }: { ring: Ring; delay: number }) => {
  const fillPct = Math.min(Math.max(ring.value / ring.max, 0), 1);
  const targetOffset = CIRCUMFERENCE * (1 - fillPct);
  const [offset, setOffset] = useState(CIRCUMFERENCE);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setOffset(targetOffset);
      setCount(ring.value);
      return;
    }

    const start = performance.now() + delay;
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) {
        frameId = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / FILL_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ring.value * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    const arcTimeout = window.setTimeout(() => setOffset(targetOffset), delay);
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(arcTimeout);
    };
  }, [ring.value, delay, targetOffset]);

  return (
    <div className='relative flex flex-col items-center'>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className='-rotate-90'
        aria-hidden='true'
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill='none'
          stroke='rgba(255,255,255,0.08)'
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill='none'
          stroke={ring.stroke}
          strokeWidth={STROKE}
          strokeLinecap='round'
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{
            transition: `stroke-dashoffset ${FILL_DURATION}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
          }}
        />
      </svg>
      <div
        className={clsxm(
          'pointer-events-none absolute inset-0 flex flex-col items-center justify-center',
          roboto.className,
        )}
        aria-label={`${ring.value}${ring.suffix ?? ''} ${ring.label}`}
        role='img'
      >
        <span
          className={clsxm('text-3xl font-bold leading-none', ring.numberClass)}
        >
          {count}
          {ring.suffix ?? ''}
        </span>
        <span className='mt-1 max-w-[88px] text-center text-[10px] font-medium uppercase leading-tight tracking-wide text-white/60'>
          {ring.label}
        </span>
      </div>
    </div>
  );
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

'use client';
import { roboto } from '@assets/fonts';
import { Magnetic } from '@components/Magnetic';
import { clsxm } from '@repo/utils';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ReactNode, useEffect, useRef, useState } from 'react';

export type SkillBlock = {
  /**
   * Which edge the whole block lives on. `left` blocks slide in from
   * off-screen-left; `right` slides in from the right. Matches the
   * existing self-start / self-end visual layout one-to-one.
   */
  side: 'left' | 'right';
  /** Icon JSX rendered above the hashtag list. */
  icon: ReactNode;
  /** Skill names rendered as `#name` chips inside the block. */
  skills: string[];
};

/**
 * Static (non-animated) rendering of a single skill block. Used for
 * SSR, the first client render before hydration completes, and the
 * `prefers-reduced-motion` path. Keeping a single source of truth for
 * the "final state" avoids drift between the animated and static
 * versions.
 */
const StaticBlock = ({ block }: { block: SkillBlock }) => (
  <Magnetic>
    <div
      className={clsxm(
        'm-2 w-[320px]',
        block.side === 'left' ? 'self-start' : 'self-end',
      )}
    >
      {block.icon}
      <ul className='flex flex-wrap justify-center gap-2'>
        {block.skills.map((skill) => (
          <li key={skill}>{`#${skill}`}</li>
        ))}
      </ul>
    </div>
  </Magnetic>
);

type AnimatedBlockProps = {
  block: SkillBlock;
};

/**
 * Scroll-driven animated version of a skill block.
 *
 * Two layered animations compose the wave:
 *
 *  1. The whole block slides in horizontally from its own side as
 *     you scroll toward it. `useScroll` tracks the block's position
 *     relative to the viewport; `useTransform` maps that progress
 *     from `[0, 1]` to `[±200px, 0]`. Scroll-driven on purpose —
 *     earlier IntersectionObserver-based attempts could trigger
 *     while the block was above the viewport, so the user only saw
 *     the resolved final state. Scroll-driven motion can't miss:
 *     the element's transform is always derived from current scroll.
 *
 *  2. Inside the block the hashtag chips do the wave. Each chip
 *     starts with `y = sin(i * 0.9) * 56`, so adjacent chips begin
 *     at different heights — that's the curl. A per-chip phase
 *     shift (`i * 0.03`) staggers the ripple left-to-right.
 *
 * Only mounted post-hydration (see `SkillsSection` below) — that
 * avoids the SSR/client mismatch you'd otherwise hit when framer-
 * motion produces a `style="opacity: 0; transform: translateY(...)"`
 * during SSR with a numeric value that doesn't match the client's
 * scroll-derived value exactly.
 */
const AnimatedBlock = ({ block }: AnimatedBlockProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const fromX = block.side === 'left' ? -200 : 200;

  // Track progress from "block top edge hits the bottom of viewport"
  // (0) to "block top hits 35% from the top of viewport" (1). That
  // window lands the resolved final state right where the user is
  // actually looking, instead of resolving offscreen above the fold.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'start 35%'],
  });

  const x = useTransform(scrollYProgress, [0, 1], [fromX, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <Magnetic>
      <div
        className={clsxm(
          'm-2 w-[320px]',
          block.side === 'left' ? 'self-start' : 'self-end',
        )}
      >
        <motion.div ref={ref} style={{ x, opacity }}>
          {block.icon}
          <ul className='flex flex-wrap justify-center gap-2'>
            {block.skills.map((skill, i) => (
              <AnimatedTag
                key={skill}
                index={i}
                scrollYProgress={scrollYProgress}
              >
                {`#${skill}`}
              </AnimatedTag>
            ))}
          </ul>
        </motion.div>
      </div>
    </Magnetic>
  );
};

type AnimatedTagProps = {
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  children: ReactNode;
};

/**
 * One hashtag chip — Y position and opacity driven by the parent
 * block's `scrollYProgress` with a per-index phase shift, so the
 * chips don't reveal together. They roll in left-to-right with the
 * sine wave riding on top.
 *
 *   `sin(i * 0.9) * 56` → up to ±56px Y offset, alternating direction
 *     between adjacent chips = the wave silhouette.
 *
 *   `phase = clamp(i * 0.03, 0, 0.4)` → each chip starts revealing
 *     i*0.03 later than the previous, clamped so the last chip still
 *     completes inside the visible scroll range.
 */
const AnimatedTag = ({
  index,
  scrollYProgress,
  children,
}: AnimatedTagProps) => {
  const initialY = Math.sin(index * 0.9) * 56;
  const phase = Math.min(index * 0.03, 0.4);

  const y = useTransform(scrollYProgress, [phase, phase + 0.5], [initialY, 0]);
  const opacity = useTransform(scrollYProgress, [phase, phase + 0.3], [0, 1]);

  return <motion.li style={{ y, opacity }}>{children}</motion.li>;
};

type Props = {
  blocks: SkillBlock[];
};

/**
 * Skills section that wakes up as you scroll into it.
 *
 * See `AnimatedBlock` for the animation details. The wrapper here
 * arranges blocks in a column with alternating self-start/self-end
 * alignment and clips horizontal overflow so the initial off-screen
 * X-translation doesn't briefly nudge the body scrollbar.
 *
 * Renders the static version during SSR and the first client render,
 * then swaps to the animated version after `useEffect` fires. This
 * two-pass strategy avoids the hydration mismatch you'd otherwise
 * hit: `useScroll` + `useTransform` produce numeric `style` values
 * that don't match between server (no scroll context, defaults) and
 * client (real scroll + element dimensions). By rendering the same
 * static output on both sides of the SSR boundary, hydration is
 * clean and the animation activates a tick later.
 *
 * Honors `prefers-reduced-motion` by staying on the static version
 * forever.
 */
export const SkillsSection = ({ blocks }: Props) => {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const animated = mounted && !reduce;

  return (
    <section
      className={clsxm(
        roboto.className,
        'mx-auto my-10 flex max-w-[672px] flex-col items-center',
      )}
    >
      {/* No overflow-hidden on the section — the body has
          `overflow-x: clip` globally, which swallows the ±200px
          initial X translation without nudging the page scrollbar.
          Clipping at the section level would shear the tags' rounded
          edges mid-animation and looks awful. */}
      {blocks.map((block, bi) =>
        animated ? (
          <AnimatedBlock key={bi} block={block} />
        ) : (
          <StaticBlock key={bi} block={block} />
        ),
      )}
    </section>
  );
};

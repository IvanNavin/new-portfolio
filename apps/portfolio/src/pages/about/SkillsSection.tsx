import { type ReactNode, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { clsxm } from "@/lib/utils";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { Magnetic } from "@/components/Magnetic";

export type SkillBlock = {
  /** Which edge the block lives on / slides in from. */
  side: "left" | "right";
  icon: ReactNode;
  skills: string[];
};

type ScrollRef = React.RefObject<HTMLElement | null>;

const StaticBlock = ({ block }: { block: SkillBlock }) => (
  <Magnetic>
    <div
      className={clsxm(
        "m-2 w-[320px]",
        block.side === "left" ? "self-start" : "self-end",
      )}
    >
      {block.icon}
      <ul className="flex flex-wrap justify-center gap-2">
        {block.skills.map((skill) => (
          <li key={skill}>{`#${skill}`}</li>
        ))}
      </ul>
    </div>
  </Magnetic>
);

/**
 * Scroll-driven block: slides in from its side, hashtags roll in as a sine
 * wave. Progress comes from the layout-based hook (3D-safe) instead of
 * framer's `useScroll`, which is broken inside the cube face.
 */
const AnimatedBlock = ({
  block,
  scrollRef,
}: {
  block: SkillBlock;
  scrollRef: ScrollRef;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const fromX = block.side === "left" ? -200 : 200;

  const scrollYProgress = useScrollProgress(
    scrollRef,
    ref,
    "start end",
    "start 35%",
  );
  const x = useTransform(scrollYProgress, [0, 1], [fromX, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <Magnetic>
      <div
        className={clsxm(
          "m-2 w-[320px]",
          block.side === "left" ? "self-start" : "self-end",
        )}
      >
        <motion.div ref={ref} style={{ x, opacity }}>
          {block.icon}
          <ul className="flex flex-wrap justify-center gap-2">
            {block.skills.map((skill, i) => (
              <AnimatedTag key={skill} index={i} progress={scrollYProgress}>
                {`#${skill}`}
              </AnimatedTag>
            ))}
          </ul>
        </motion.div>
      </div>
    </Magnetic>
  );
};

const AnimatedTag = ({
  index,
  progress,
  children,
}: {
  index: number;
  progress: MotionValue<number>;
  children: ReactNode;
}) => {
  const initialY = Math.sin(index * 0.9) * 56;
  const phase = Math.min(index * 0.03, 0.4);
  const y = useTransform(progress, [phase, phase + 0.5], [initialY, 0]);
  const opacity = useTransform(progress, [phase, phase + 0.3], [0, 1]);
  return <motion.li style={{ y, opacity }}>{children}</motion.li>;
};

type Props = {
  blocks: SkillBlock[];
  scrollRef: ScrollRef;
};

/** Skills section that wakes up as you scroll into it. */
export const SkillsSection = ({ blocks, scrollRef }: Props) => {
  const reduce = useReducedMotion();

  return (
    <section className="font-roboto mx-auto my-10 flex max-w-[672px] flex-col items-center">
      {blocks.map((block, bi) =>
        reduce ? (
          <StaticBlock key={bi} block={block} />
        ) : (
          <AnimatedBlock key={bi} block={block} scrollRef={scrollRef} />
        ),
      )}
    </section>
  );
};

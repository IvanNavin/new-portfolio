import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { clsxm } from "@/lib/utils";
import { useScrollProgress } from "@/lib/useScrollProgress";
import Orb from "@/components/reactbits/Orb";

export type CareerEntry = {
  company: string;
  companySubtitle?: string;
  role: string;
  period: string;
  location?: string;
  workMode?: string;
  bullets: string[];
  stack?: string[];
  isCurrent?: boolean;
  logoUrl?: string;
  avatarGradient?: string;
};

type Props = {
  title: string;
  nowLabel: string;
  ariaLabel: string;
  entries: CareerEntry[];
  scrollRef: React.RefObject<HTMLElement | null>;
};

const BLOB_SIZE = 84;

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-medium tracking-wider text-white/70 uppercase">
    {children}
  </span>
);

const StackPill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-md border border-yellow-400/20 bg-yellow-400/5 px-2 py-0.5 text-xs text-yellow-100/80">
    {children}
  </span>
);

/** Glowing WebGL orb that rides the leading edge of the timeline fill. */
const OrbTraveler = () => (
  <div
    className="pointer-events-none relative"
    style={{ width: BLOB_SIZE, height: BLOB_SIZE }}
  >
    {/* Black core that fades out before the edge — gives the orb a solid dark
        centre without a hard black disc showing against the hex grid. */}
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background:
          "radial-gradient(circle, #000 0%, #000 46%, transparent 70%)",
      }}
    />
    <div className="absolute inset-0">
      <Orb
        hue={359}
        forceHoverState
        hoverIntensity={1}
        backgroundColor="#000000"
      />
    </div>
  </div>
);

export const CareerTimeline = ({
  title,
  nowLabel,
  ariaLabel,
  entries,
  scrollRef,
}: Props) => {
  const ref = useRef<HTMLOListElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
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

  const scrollYProgress = useScrollProgress(
    scrollRef,
    ref,
    "start 80%",
    "end 30%",
  );
  const fillHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const blobY = useTransform(
    scrollYProgress,
    [0, 1],
    [-BLOB_SIZE / 2, olHeight - BLOB_SIZE / 2],
  );
  const blobOpacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.96, 1],
    [0, 1, 1, 0],
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const idx = Math.min(
      entries.length - 1,
      Math.max(0, Math.floor(latest * entries.length)),
    );
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  });

  return (
    <section className="my-12" aria-label={ariaLabel}>
      <h2 className="font-russo mb-8 text-[28px] tracking-wide text-white">
        {title}
      </h2>
      <ol
        ref={ref}
        className="relative ml-2 border-l-[2px] border-white/15 pl-10"
      >
        {!prefersReducedMotion && (
          <>
            <motion.div
              aria-hidden="true"
              style={{ height: fillHeight }}
              className="pointer-events-none absolute top-0 -left-[2px] w-[2px] rounded-full bg-gradient-to-b from-yellow-200 via-amber-300 to-orange-400 shadow-[0_0_12px_rgba(253,224,71,0.4)]"
            />
            <motion.div
              style={{ y: blobY, opacity: blobOpacity, left: -BLOB_SIZE / 2 }}
              className="pointer-events-none absolute top-0 will-change-transform"
            >
              <OrbTraveler />
            </motion.div>
          </>
        )}
        {entries.map((entry, i) => {
          const isActive = !prefersReducedMotion && activeIndex === i;
          return (
            <li
              key={`${entry.company}-${i}`}
              className="relative mb-8 last:mb-0"
            >
              <div
                className={clsxm(
                  "rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300",
                  isActive
                    ? "-translate-y-0.5 border-yellow-300/40 bg-white/[0.08] shadow-[0_8px_36px_rgba(253,224,71,0.18)]"
                    : "border-white/10 bg-white/[0.04]",
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-md bg-yellow-300/10 px-2 py-1 text-[11px] font-semibold tracking-wider text-yellow-200/90 uppercase ring-1 ring-yellow-300/20">
                    {entry.period}
                  </span>
                  {entry.isCurrent && (
                    <span className="rounded-full bg-yellow-300/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-yellow-100 uppercase shadow-[0_0_12px_rgba(253,224,71,0.5)]">
                      {nowLabel}
                    </span>
                  )}
                </div>
                <p className="font-roboto mt-2 text-lg font-semibold text-white">
                  {entry.role}
                  {entry.company && (
                    <>
                      {" · "}
                      <span className="text-yellow-300">{entry.company}</span>
                    </>
                  )}
                </p>
                {(entry.companySubtitle ||
                  entry.location ||
                  entry.workMode) && (
                  <div className="font-roboto mt-2 flex flex-wrap items-center gap-2">
                    {entry.companySubtitle && (
                      <span className="text-xs text-white/60 italic">
                        {entry.companySubtitle}
                      </span>
                    )}
                    {entry.location && <Chip>{entry.location}</Chip>}
                    {entry.workMode && <Chip>{entry.workMode}</Chip>}
                  </div>
                )}
                {entry.bullets.length > 0 && (
                  <ul className="font-roboto mt-3 space-y-1.5 text-sm text-white/75">
                    {entry.bullets.map((bullet, j) => (
                      <li key={j} className="flex gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-[7px] inline-block size-1 shrink-0 rounded-full bg-yellow-400/70"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {entry.stack && entry.stack.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {entry.stack.map((tech) => (
                      <StackPill key={tech}>{tech}</StackPill>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

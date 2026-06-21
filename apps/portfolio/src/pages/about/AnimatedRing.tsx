import { useEffect, useState } from "react";
import { clsxm } from "@/lib/utils";

export type Ring = {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  numberClass: string;
  stroke: string;
};

type Props = {
  ring: Ring;
  delay?: number;
  size?: number;
  strokeWidth?: number;
};

const FILL_DURATION = 1400;

export const AnimatedRing = ({
  ring,
  delay = 0,
  size = 132,
  strokeWidth = 8,
}: Props) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillPct = Math.min(Math.max(ring.value / ring.max, 0), 1);
  const targetOffset = circumference * (1 - fillPct);
  const [reduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  // Reduced motion jumps straight to the resolved state via the initial value.
  const [offset, setOffset] = useState(() =>
    reduceMotion ? targetOffset : circumference,
  );
  const [count, setCount] = useState(() => (reduceMotion ? ring.value : 0));

  useEffect(() => {
    if (reduceMotion) return;

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
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    const arcTimeout = window.setTimeout(() => setOffset(targetOffset), delay);
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(arcTimeout);
    };
  }, [ring.value, delay, targetOffset, circumference, reduceMotion]);

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ring.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: `stroke-dashoffset ${FILL_DURATION}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
          }}
        />
      </svg>
      <div
        className="font-roboto pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        aria-label={`${ring.value}${ring.suffix ?? ""} ${ring.label}`}
        role="img"
      >
        <span
          className={clsxm("text-3xl leading-none font-bold", ring.numberClass)}
        >
          {count}
          {ring.suffix ?? ""}
        </span>
        <span
          style={{ maxWidth: Math.round(size * 0.8) }}
          className={clsxm(
            "mt-1 text-center text-[10px] font-medium uppercase",
            "leading-tight tracking-wide text-white/60",
            "[hyphens:auto] break-words",
          )}
        >
          {ring.label}
        </span>
      </div>
    </div>
  );
};

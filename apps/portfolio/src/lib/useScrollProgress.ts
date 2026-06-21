import { useEffect } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

/**
 * Layout-based scroll progress for content living inside the 3D cube.
 *
 * framer-motion's `useScroll` measures with `getBoundingClientRect`, which is
 * skewed by the cube's 3D transform, so it freezes on the side faces. This hook
 * computes the same 0→1 progress from LAYOUT values (`scrollTop`, `offsetTop`,
 * `clientHeight`) — all immune to CSS transforms — and exposes it as a
 * `MotionValue`, so `useTransform`/`useMotionValueEvent` keep working unchanged.
 *
 * `offset` mirrors framer's format: a pair of "targetEdge containerEdge"
 * strings, e.g. ['start end', 'start 35%']. Edges: start|end|center|N%|number.
 */
export function useScrollProgress(
  containerRef: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>,
  offsetStart = "start end",
  offsetEnd = "end start",
): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    const container = containerRef.current;
    const target = targetRef.current;
    if (!container || !target) return;

    const [tp0, cp0] = parseOffset(offsetStart);
    const [tp1, cp1] = parseOffset(offsetEnd);

    const update = () => {
      const ch = container.clientHeight;
      const th = target.offsetHeight;
      const top = offsetTopWithin(target, container);
      const st = container.scrollTop;
      // scrollTop at which each keyframe aligns: target point == container point
      const st0 = top + tp0 * th - cp0 * ch;
      const st1 = top + tp1 * th - cp1 * ch;
      const denom = st1 - st0;
      const p = denom === 0 ? 0 : (st - st0) / denom;
      progress.set(Math.max(0, Math.min(1, p)));
    };

    update();
    container.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(target);
    return () => {
      container.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [containerRef, targetRef, offsetStart, offsetEnd, progress]);

  return progress;
}

/** Distance from `el` top to `container` top, summed across offsetParents. */
function offsetTopWithin(el: HTMLElement, container: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== container) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

/** Parse "targetEdge containerEdge" → [targetFraction, containerFraction]. */
function parseOffset(entry: string): [number, number] {
  const [t, c] = entry.trim().split(/\s+/);
  return [edge(t), edge(c)];
}

function edge(e: string): number {
  if (e === "start") return 0;
  if (e === "end") return 1;
  if (e === "center") return 0.5;
  if (e.endsWith("%")) return parseFloat(e) / 100;
  return parseFloat(e) || 0;
}

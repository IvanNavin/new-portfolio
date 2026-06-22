import gsap from "gsap";
import {
  cloneElement,
  useEffect,
  useRef,
  type ReactElement,
  type Ref,
} from "react";

type MagneticProps = {
  children: ReactElement<{ ref?: Ref<HTMLElement> }>;
};

/**
 * Wraps a single child and gives it an elastic "pull toward the cursor" on
 * hover (ported from the original portfolio). The child must accept a ref.
 */
export function Magnetic({ children }: MagneticProps) {
  const magnetic = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = magnetic.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });
    const yTo = gsap.quickTo(el, "y", {
      duration: 1,
      ease: "elastic.out(1, 0.3)",
    });

    const onMove = (e: MouseEvent) => {
      const { height, width, left, top } = el.getBoundingClientRect();
      xTo((e.clientX - (left + width / 2)) * 0.35);
      yTo((e.clientY - (top + height / 2)) * 0.35);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Forward the ref onto the child itself (not a wrapper) so the magnetic
  // transform applies in place and the child's layout/alignment is preserved.
  // eslint-disable-next-line react-hooks/refs
  return cloneElement(children, { ref: magnetic });
}

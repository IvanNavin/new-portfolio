import gsap from 'gsap';
import { cloneElement, ReactElement, useEffect, useRef } from 'react';

type MagneticProps = {
  children: ReactElement;
};

export function Magnetic({ children }: MagneticProps) {
  const magnetic = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const xTo = gsap.quickTo(magnetic.current, 'x', {
      duration: 1,
      ease: 'elastic.out(1, 0.3)',
    });
    const yTo = gsap.quickTo(magnetic.current, 'y', {
      duration: 1,
      ease: 'elastic.out(1, 0.3)',
    });

    if (!magnetic.current) return;

    magnetic.current.addEventListener('mousemove', (e) => {
      if (!magnetic.current) return;
      const { clientX, clientY } = e;
      const { height, width, left, top } =
        magnetic.current.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * 0.35);
      yTo(y * 0.35);
    });
    magnetic.current?.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  }, []);

  return cloneElement(children, { ref: magnetic });
}

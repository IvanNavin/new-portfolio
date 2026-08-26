'use client';

import { useEffect, useState } from 'react';

const COLORS = ['var(--accent)', 'var(--xp)', 'var(--warn)', 'var(--info)'];

/**
 * Pieces are computed once from the index rather than at random: a value that
 * changes every render is impure, and the burst looks the same either way.
 */
const PIECES = Array.from({ length: 54 }, (_, index) => ({
  id: index,
  left: (index * 37) % 100,
  drift: ((index * 29) % 40) - 20,
  delay: ((index * 13) % 22) / 20,
  duration: 2.3 + ((index * 7) % 12) / 10,
  spin: 360 + ((index * 53) % 720),
  size: 5 + (index % 4) * 2,
  color: COLORS[index % COLORS.length],
  round: index % 3 === 0,
}));

/** A short celebration when a mission is solved. Silent for reduced motion. */
export const Confetti = ({ active }: { active: boolean }) => {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (!active || !allowed) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
    >
      {PIECES.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * (piece.round ? 1 : 1.8),
            background: piece.color,
            borderRadius: piece.round ? '50%' : '1px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ['--drift' as string]: `${piece.drift}vw`,
            ['--spin' as string]: `${piece.spin}deg`,
          }}
        />
      ))}
    </div>
  );
};

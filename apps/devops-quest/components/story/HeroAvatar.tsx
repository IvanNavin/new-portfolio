import { cn } from '@/lib/cn';

type HeroAvatarProps = {
  size?: number;
  className?: string;
};

/**
 * Тарас — the raccoon you play. The species earns the role honestly: nocturnal,
 * digs through bins for the one useful thing, washes everything twice. Fixed
 * fur colours rather than theme tokens, because a character keeps its own
 * palette in light and dark alike.
 */
export const HeroAvatar = ({ size = 44, className }: HeroAvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role="img"
    aria-label="Тарас, єнот"
    className={cn('shrink-0', className)}
  >
    <circle cx="32" cy="32" r="31" fill="#111823" />
    <circle
      cx="32"
      cy="32"
      r="31"
      fill="none"
      stroke="#39d98a"
      strokeOpacity="0.35"
      strokeWidth="1.5"
    />

    {/* ears */}
    <path d="M14 24 L17 10 L29 18 Z" fill="#7c8798" />
    <path d="M50 24 L47 10 L35 18 Z" fill="#7c8798" />
    <path d="M17 22 L19 14 L26 19 Z" fill="#2b3444" />
    <path d="M47 22 L45 14 L38 19 Z" fill="#2b3444" />

    {/* head */}
    <path
      d="M32 17c11 0 18 7 18 17 0 10-8 17-18 17s-18-7-18-17c0-10 7-17 18-17Z"
      fill="#7c8798"
    />

    {/* muzzle */}
    <path
      d="M32 33c7 0 11 4 11 9s-5 8-11 8-11-3-11-8 4-9 11-9Z"
      fill="#e8edf4"
    />

    {/* bandit mask */}
    <path
      d="M20 30c0-5 4-8 8-8 2 0 3 1 4 2 1-1 2-2 4-2 4 0 8 3 8 8 0 4-4 6-8 6-2 0-3-1-4-2-1 1-2 2-4 2-4 0-8-2-8-6Z"
      fill="#2b3444"
    />

    {/* eyes */}
    <circle cx="26" cy="30" r="3.4" fill="#e8edf4" />
    <circle cx="38" cy="30" r="3.4" fill="#e8edf4" />
    <circle cx="26.8" cy="30.4" r="1.8" fill="#111823" />
    <circle cx="38.8" cy="30.4" r="1.8" fill="#111823" />
    <circle cx="27.6" cy="29.4" r="0.7" fill="#ffffff" />
    <circle cx="39.6" cy="29.4" r="0.7" fill="#ffffff" />

    {/* nose */}
    <path
      d="M32 38c2 0 3.4 1 3.4 2.2 0 1.4-1.6 2.4-3.4 2.4s-3.4-1-3.4-2.4C28.6 39 30 38 32 38Z"
      fill="#2b3444"
    />
    <path
      d="M32 43v3"
      stroke="#2b3444"
      strokeWidth="1.4"
      strokeLinecap="round"
    />

    {/* whiskers */}
    <path
      d="M20 40h-5M20 43h-4.5M44 40h5M44 43h4.5"
      stroke="#e8edf4"
      strokeOpacity="0.5"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

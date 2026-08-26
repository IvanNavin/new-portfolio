import { cn } from '@/lib/cn';

type MentorAvatarProps = {
  size?: number;
  className?: string;
};

/**
 * Оксана — the team lead who handed Тарас the keys and went on holiday. An owl,
 * because the person who ran the night shift for seven years before him would
 * be one. Same fixed-palette rule as the hero: a character keeps its colours in
 * both themes.
 */
export const MentorAvatar = ({ size = 36, className }: MentorAvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    role="img"
    aria-label="Оксана, сова"
    className={cn('shrink-0', className)}
  >
    <circle cx="32" cy="32" r="31" fill="#141019" />
    <circle
      cx="32"
      cy="32"
      r="31"
      fill="none"
      stroke="#b78bff"
      strokeOpacity="0.35"
      strokeWidth="1.5"
    />

    {/* ear tufts */}
    <path d="M15 21 L18 9 L28 17 Z" fill="#a2794f" />
    <path d="M49 21 L46 9 L36 17 Z" fill="#a2794f" />

    {/* head */}
    <path
      d="M32 15c11 0 18 8 18 18 0 11-8 18-18 18s-18-7-18-18c0-10 7-18 18-18Z"
      fill="#c08f5c"
    />

    {/* brow feathers */}
    <path
      d="M14 30c4-7 12-9 18-5 6-4 14-2 18 5-3-1-6-1-8 0-4 2-7 2-10 0-3 2-6 2-10 0-2-1-5-1-8 0Z"
      fill="#a2794f"
    />

    {/* eye discs */}
    <circle cx="24" cy="32" r="8.5" fill="#f3ead8" />
    <circle cx="40" cy="32" r="8.5" fill="#f3ead8" />
    <circle cx="24" cy="32" r="5" fill="#141019" />
    <circle cx="40" cy="32" r="5" fill="#141019" />
    <circle cx="25.6" cy="30.4" r="1.6" fill="#ffffff" />
    <circle cx="41.6" cy="30.4" r="1.6" fill="#ffffff" />

    {/* beak */}
    <path
      d="M32 36l3.6 5.4c.4.7-.1 1.6-.9 1.6h-5.4c-.8 0-1.3-.9-.9-1.6L32 36Z"
      fill="#f2c14e"
    />

    {/* chest feathers */}
    <path
      d="M24 46c2 2 5 3 8 3s6-1 8-3c-1 3-4 5-8 5s-7-2-8-5Z"
      fill="#a2794f"
    />
  </svg>
);

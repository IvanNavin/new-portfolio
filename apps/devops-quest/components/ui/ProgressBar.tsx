import { cn } from '@/lib/cn';

type ProgressBarProps = {
  /** 0..1 */
  value: number;
  className?: string;
  tone?: 'accent' | 'xp';
};

export const ProgressBar = ({
  value,
  className,
  tone = 'accent',
}: ProgressBarProps) => (
  <div
    className={cn(
      'h-1.5 overflow-hidden rounded-full bg-surface-sunken',
      className,
    )}
  >
    <div
      className={cn(
        'h-full rounded-full transition-[width] duration-500',
        tone === 'accent' ? 'bg-accent' : 'bg-xp',
      )}
      style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%` }}
    />
  </div>
);

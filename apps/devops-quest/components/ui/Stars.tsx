import { cn } from '@/lib/cn';

type StarsProps = {
  value: number;
  max?: number;
  className?: string;
};

export const Stars = ({ value, max = 3, className }: StarsProps) => (
  <span
    className={cn('inline-flex gap-0.5 text-sm leading-none', className)}
    aria-label={`${value} з ${max} зірок`}
  >
    {Array.from({ length: max }, (_, index) => (
      <span
        key={index}
        className={index < value ? 'text-warn' : 'text-edge-strong'}
      >
        ★
      </span>
    ))}
  </span>
);

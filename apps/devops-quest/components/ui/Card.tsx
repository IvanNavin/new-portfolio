import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => (
  <div
    className={cn('rounded-xl border border-edge bg-surface-raised', className)}
  >
    {children}
  </div>
);

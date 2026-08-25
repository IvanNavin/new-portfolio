'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost' | 'quiet' | 'danger';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent-soft text-accent border-accent/40 hover:bg-accent/20 hover:border-accent/70',
  ghost:
    'bg-surface-raised text-ink border-edge hover:border-edge-strong hover:bg-surface-sunken',
  quiet:
    'bg-transparent text-ink-dim border-transparent hover:text-ink hover:bg-surface-raised',
  danger: 'bg-danger-soft text-danger border-danger/40 hover:bg-danger/20',
};

const SIZES: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs gap-1.5',
  md: 'px-3.5 py-2 text-sm gap-2',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export const Button = ({
  variant = 'ghost',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) => (
  <button
    type="button"
    className={cn(
      'inline-flex items-center justify-center rounded-lg border font-medium transition-colors',
      'disabled:cursor-not-allowed disabled:opacity-45',
      VARIANTS[variant],
      SIZES[size],
      className,
    )}
    {...rest}
  >
    {children}
  </button>
);

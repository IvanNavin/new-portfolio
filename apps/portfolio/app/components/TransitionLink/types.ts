import { LinkProps } from 'next/link';
import { ReactNode } from 'react';

export type TransitionLinkProps = {
  children: ReactNode;
  href: string;
  className?: string;
} & LinkProps;

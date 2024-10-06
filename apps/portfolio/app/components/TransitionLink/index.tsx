'use client';
import { useAnimateContext } from '@components/AnimateProvider/useAnimateContext';
import { TransitionLinkProps } from '@components/TransitionLink/types';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, MouseEvent } from 'react';

export const TransitionLink = forwardRef<
  HTMLAnchorElement,
  TransitionLinkProps
>(({ children, href, ...props }, ref) => {
  const router = useRouter();
  const controls = useAnimateContext();

  const handleTransition = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Start the exit animation
    await controls?.start({
      opacity: 0,
      transition: { duration: 0.5 },
    });

    router.push(href);
  };

  return (
    <NextLink ref={ref} {...props} href={href} onClick={handleTransition}>
      {children}
    </NextLink>
  );
});

TransitionLink.displayName = 'TransitionLink';

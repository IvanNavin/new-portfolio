import { russoOne } from '@assets/fonts';
import { TransitionLink } from '@components/TransitionLink';
import { useHover } from '@mantine/hooks';
import { clsxm, isTouchDevice } from '@repo/utils';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type NavMenuItemProps = {
  first: string;
  second: string;
  href: string;
};

type Props = {
  item: NavMenuItemProps;
  className?: string;
  textClassName?: string;
  index: number;
};

const AUTO_INTERVAL_MS = 3000;
const STAGGER_MS = 500;

export const NavMenuItem = ({
  item: { first, second, href },
  className,
  textClassName,
  index,
}: Props) => {
  const { hovered, ref } = useHover<HTMLAnchorElement>();
  const [isTouch, setIsTouch] = useState(false);
  const [autoFlipped, setAutoFlipped] = useState(false);

  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  useEffect(() => {
    if (!isTouch) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const initialTimeout = setTimeout(() => {
      setAutoFlipped((prev) => !prev);
      intervalId = setInterval(() => {
        setAutoFlipped((prev) => !prev);
      }, AUTO_INTERVAL_MS);
    }, index * STAGGER_MS);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTouch, index]);

  const showSecond = isTouch ? autoFlipped : hovered;

  const faceClass = clsxm(
    'opacity-0 text-[8vw] text-white shadow-black text-shadow',
    '[backface-visibility:hidden]',
    russoOne.className,
    textClassName,
  );

  return (
    <TransitionLink
      href={href}
      ref={ref}
      className={clsxm(
        'group overflow-visible flex self-start border-transparent bg-transparent p-0 text-left',
        'focus-within:border-transparent focus-within:outline-transparent select-none relative',
        '[perspective:1000px]',
        className,
      )}
    >
      <motion.span
        className='relative inline-block transition-[margin] duration-500 ease-in-out group-hover:ml-10'
        style={{
          transformStyle: 'preserve-3d',
          animation: `slideText 0.5s forwards ${index + 0.5}s`,
        }}
        animate={{ rotateX: showSecond ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <span className={faceClass}>{first}</span>
        <span
          className={clsxm(
            faceClass,
            'absolute inset-0 [transform:rotateX(180deg)]',
          )}
        >
          {second}
        </span>
      </motion.span>
    </TransitionLink>
  );
};

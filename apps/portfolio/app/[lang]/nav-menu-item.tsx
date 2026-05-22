import { russoOne } from '@assets/fonts';
import { TransitionLink } from '@components/TransitionLink';
import { useHover } from '@mantine/hooks';
import { clsxm, isTouchDevice } from '@repo/utils';
import { CSSProperties, useEffect, useState } from 'react';

import styles from './nav-menu-item.module.css';

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

export const NavMenuItem = ({
  item: { first, second, href },
  className,
  textClassName,
  index,
}: Props) => {
  const { hovered, ref } = useHover<HTMLAnchorElement>();
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  const baseTextClass = clsxm(
    'text-[8vw] text-white shadow-black text-shadow',
    russoOne.className,
    textClassName,
  );

  // Spacer needs the longer string so the cube box never clips a face.
  const spacer = first.length >= second.length ? first : second;

  // Per-item delay so the four menu items flip in a wave on mobile.
  const cubeStyle = {
    '--flip-delay': `${index * 0.4}s`,
    animation: `slideText 0.5s forwards ${index + 0.5}s`,
  } as CSSProperties;

  return (
    <TransitionLink
      href={href}
      ref={ref}
      className={clsxm(
        'group flex self-start border-transparent bg-transparent p-0 text-left',
        'focus-within:border-transparent focus-within:outline-transparent select-none relative',
        isTouch && 'touch',
        className,
      )}
    >
      <span
        className={clsxm(
          styles.cubeScene,
          'opacity-0 transition-[margin] duration-500 ease-in-out group-hover:ml-10',
        )}
        style={cubeStyle}
      >
        <span className={styles.cube}>
          {/* spacer — invisible, dictates cube box size */}
          <span className={clsxm(baseTextClass, styles.spacer)}>{spacer}</span>

          {/* front face — desktop variant: hover swaps the text in place */}
          <span
            className={clsxm(
              baseTextClass,
              styles.face,
              styles.faceFront,
              styles.desktopOnly,
            )}
          >
            {hovered ? second : first}
          </span>

          {/* front face — touch variant: always shows the first text;
              the cube animation reveals the bottom face below */}
          <span
            className={clsxm(
              baseTextClass,
              styles.face,
              styles.faceFront,
              styles.touchOnly,
            )}
          >
            {first}
          </span>

          {/* bottom face — only used while the cube is rotating on touch */}
          <span
            className={clsxm(
              baseTextClass,
              styles.face,
              styles.faceBottom,
              styles.touchOnly,
            )}
          >
            {second}
          </span>
        </span>
      </span>
    </TransitionLink>
  );
};

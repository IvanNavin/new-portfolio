import cn from 'classnames';
import { useEffect, useState } from 'react';

import s from './RotateLock.module.scss';

export const RotateLock = () => {
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(pointer: coarse) and (orientation: landscape)',
    );

    const check = (e?: unknown) => {
      setIsLandscapeMobile(
        e ? e?.['matches' as keyof typeof e] : mediaQuery.matches,
      );
    };

    mediaQuery.addEventListener('change', check);
    window.addEventListener('resize', check);

    check();

    return () => {
      mediaQuery.removeEventListener('change', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  useEffect(() => {
    if (isLandscapeMobile) {
      // “заморозити” сторінку
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // розморозити
      const top = parseInt(document.body.style.top || '0') * -1;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, top);
    }
  }, [isLandscapeMobile]);

  return (
    <div className={cn(s.rotateLock, { [s.hidden]: !isLandscapeMobile })}>
      <p>Please return the device to portrait mode</p>
    </div>
  );
};

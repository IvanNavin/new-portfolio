'use client';
import { NavigationHistoryContext } from '@components/NavigationHistoryProvider/context';
import { HistoryEntry } from '@components/NavigationHistoryProvider/types';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useIsClient } from 'usehooks-ts';

export const NavigationHistoryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    previousPath.current = pathname;

    const handlePopState = () => {
      const newPath = window.location.pathname;

      if (previousPath.current && previousPath.current !== newPath) {
        const newDirection =
          newPath.length < previousPath.current.length ? 'backward' : 'forward';
        setDirection(newDirection);
        setHistory((prev) => [
          ...prev,
          { path: newPath, direction: newDirection },
        ]);
      }
      previousPath.current = newPath;
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (previousPath.current && previousPath.current !== pathname) {
      const newDirection =
        pathname.length < previousPath.current.length ? 'backward' : 'forward';

      setDirection(newDirection);
      setHistory((prev) => [
        ...prev,
        { path: pathname, direction: newDirection },
      ]);
    }

    previousPath.current = pathname;
  }, [pathname]);

  return (
    <NavigationHistoryContext.Provider value={{ history, direction }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
};

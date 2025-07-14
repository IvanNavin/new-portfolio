import { useTrackVisit } from '@app/utils/hooks/useTrackVisit';
import { usePrevious } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function VisitTracker() {
  const pathname = usePathname();
  const trackVisit = useTrackVisit();
  const prevPathname = usePrevious(pathname);

  useEffect(() => {
    (async () => {
      if (prevPathname === pathname) return;
      await trackVisit();
    })();
  }, [pathname]);

  return null;
}

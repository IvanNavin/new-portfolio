import { useTranslation } from '@i18n/client';
import { useEffect, useRef, useState } from 'react';
import { useIsClient } from 'usehooks-ts';

const factsPerPage = 4;
const duration = 7000;

export const useAbout = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [progressValue, setProgressValue] = useState(100);
  const { t } = useTranslation();
  const isClient = useIsClient();
  const isReversed = useRef(false);
  const allFacts: string[] = Object.values(
    t('about.facts', { returnObjects: true }),
  );

  const pages = [];
  for (let i = 0; i < allFacts.length; i += factsPerPage) {
    pages.push(allFacts.slice(i, i + factsPerPage));
  }

  useEffect(() => {
    let startTime = Date.now();
    let animationFrameId: number;

    const update = () => {
      const elapsed = Date.now() - startTime;
      const ltr = 100 - (elapsed / duration) * 100;
      const rtl = (elapsed / duration) * 100;
      const progress = isReversed.current ? rtl : ltr;

      if (elapsed >= duration) {
        setCurrentPage((prevPage) => {
          const isLastPage = prevPage === pages.length - 1;
          return isLastPage ? 0 : prevPage + 1;
        });
        setProgressValue(100);
        startTime = Date.now();
        isReversed.current = !isReversed.current;
      } else {
        setProgressValue(progress);
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [pages.length]);

  const currentFacts = pages[currentPage];

  return {
    t,
    isClient,
    currentFacts,
    progressValue,
  };
};

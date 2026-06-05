'use client';
import { ROUTES } from '@app/constants/routes';
import { ETrackVisitEvent } from '@app/types/trackVisitTypes';
import { useTrackVisit } from '@app/utils/hooks/useTrackVisit';
import { Magnetic } from '@components/Magnetic';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
import { Locale } from '@root/i18n-config';
import Link from 'next/link';
import { useCallback } from 'react';

type Props = {
  lang: Locale;
};

/**
 * Big animated-border CTA on the About page that opens the full
 * interactive CV at /[lang]/about/cv. The standalone PDF is still
 * downloadable from the CV page itself (toolbar), so we keep the
 * track-visit event for parity but tag it as a navigation, not a
 * file fetch.
 */
export const DownloadButton = ({ lang }: Props) => {
  const { t } = useTranslation();
  const trackVisit = useTrackVisit();

  const handleClick = useCallback(async () => {
    await trackVisit({
      event: ETrackVisitEvent.CLICK,
      extra: { target: 'about-cv' },
    });
  }, [trackVisit]);

  return (
    <Magnetic>
      <Link
        href={ROUTES.cv(lang)}
        onClick={handleClick}
        className={clsxm(
          'download text-gold relative inline-block cursor-pointer ',
          'overflow-hidden bg-transparent px-6 py-7 text-2xl uppercase tracking-wider',
        )}
      >
        <span className='absolute left-0 top-0 h-0.5 w-full animate-animate1 bg-gradient-to-r from-[#0c002b] to-yellow-500' />
        <span className='absolute right-0 top-0 h-full w-0.5 animate-animate2 bg-gradient-to-b from-[#0c002b] to-yellow-500' />
        <span className='absolute bottom-0 left-0 h-0.5 w-full animate-animate3 bg-gradient-to-l from-[#0c002b] to-yellow-500' />
        <span className='absolute left-0 top-0 h-full w-0.5 animate-animate4 bg-gradient-to-t from-[#0c002b] to-yellow-500' />
        <span className='star-blink'>
          <div />
        </span>
        <b>{t('about.readCv')}</b>
      </Link>
    </Magnetic>
  );
};

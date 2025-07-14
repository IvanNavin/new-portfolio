'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { ETrackVisitEvent } from '@app/types/trackVisitTypes';
import { useTrackVisit } from '@app/utils/hooks/useTrackVisit';
import { Container } from '@components/Container';
import { VideoFrame } from '@components/VideoFrame';
import { useTranslation } from '@i18n/client';
import Link from 'next/link';
import { useCallback } from 'react';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation();
  const trackVisit = useTrackVisit();

  const handleClick = useCallback(
    async () =>
      trackVisit({
        event: ETrackVisitEvent.CLICK,
        extra: {
          target: 'external_link',
          url: 'https://developing-accessible-interfaces.netlify.app/',
        },
      }),
    [trackVisit],
  );

  return (
    <Container
      lang={lang}
      backText={t('performances.title')}
      backPath={ROUTES.performances(lang)}
      title={t('accessibility.title')}
    >
      <VideoFrame src='https://www.youtube.com/embed/c1W9u6SN2Cw' />
      <h2 className='mb-10 mt-5 text-[32px]'>{t('accessibility.linkName')}</h2>
      <Link
        href='https://developing-accessible-interfaces.netlify.app/'
        onClick={handleClick}
        target='_blank'
      >
        https://developing-accessible-interfaces.netlify.app/
      </Link>
    </Container>
  );
}

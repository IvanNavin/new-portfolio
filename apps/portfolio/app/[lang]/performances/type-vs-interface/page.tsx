'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { ETrackVisitEvent } from '@app/types/trackVisitTypes';
import { useTrackVisit } from '@app/utils/hooks/useTrackVisit';
import { Container } from '@components/Container';
import { VideoFrame } from '@components/VideoFrame';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
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
          url: 'https://type-vs-interface.vercel.app/',
        },
      }),
    [trackVisit],
  );

  return (
    <Container
      lang={lang}
      backText={t('performances.title')}
      backPath={ROUTES.performances(lang)}
      title={t('types.title')}
    >
      <VideoFrame src='https://www.youtube.com/embed/k8V4Q1MGwro' />
      <Link
        href='https://type-vs-interface.vercel.app/'
        target='_blank'
        rel='noreferrer'
        onClick={handleClick}
        className={clsxm('block text-[16px] text-white mt-8')}
      >
        https://type-vs-interface.vercel.app/
      </Link>
    </Container>
  );
}

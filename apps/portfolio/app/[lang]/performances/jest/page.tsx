'use client';

import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { Container } from '@components/Container';
import { VideoFrame } from '@components/VideoFrame';
import { useTranslation } from '@i18n/client';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);

  return (
    <Container
      lang={lang}
      backText={t('performances.title')}
      backPath={ROUTES.performances(lang)}
      title={t('jest.title')}
    >
      <VideoFrame src='https://www.youtube.com/embed/5I-ieBMWElA?si=eQZio8c7wJB5qh21' />
      <h4 className='my-6'>{t('jest.usefulLinks')}</h4>
      <ul className='list-inside list-disc'>
        <li>
          Documentations:{' '}
          <a
            href='https://jestjs.io/docs/getting-started'
            target='_blank'
            rel='noreferrer'
            className='text-blue-500'
          >
            Jest documentation
          </a>
        </li>
        <li>
          Testing playground:{' '}
          <a
            href='https://testing-playground.com/'
            target='_blank'
            rel='noreferrer'
            className='text-blue-500'
          >
            Testing playground
          </a>
        </li>
        <li>
          This presentation is available via this{' '}
          <a
            href='https://docs.google.com/presentation/d/1xImjqRFFIQHXt2sgdj5Eiw-RhWTfdbyMM3dgAiNn9RY/edit?usp=sharing'
            target='_blank'
            rel='noreferrer'
            className='text-blue-500'
          >
            link
          </a>
        </li>
      </ul>
    </Container>
  );
}

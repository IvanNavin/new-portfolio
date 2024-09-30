'use client';

import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { Container } from '@components/Container';
import { VideoFrame } from '@components/VideoFrame';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
import Link from 'next/link';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);

  const links = [
    {
      link: 'https://ru.wikipedia.org/wiki/%D0%A0%D0%B5%D0%B3%D1%83%D0%BB%D1%8F%D1%80%D0%BD%D1%8B%D0%B5_%D0%B2%D1%8B%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F',
      label: t('regexp.wikiLink'),
    },
    { link: 'https://regexr.com/', label: 'regexr.com' },
    { link: 'https://regex101.com/', label: 'regex101.com' },
    {
      link: 'https://learn.javascript.ru/regular-expressions',
      label: t('regexp.learnJS'),
    },
    {
      link: 'https://www.exlab.net/files/tools/sheets/regexp/regexp.png',
      label: t('regexp.crib'),
    },
  ];

  return (
    <Container
      backText={t('performances.title')}
      backPath={ROUTES.performances()}
      title={t('regexp.title')}
    >
      <VideoFrame src='https://www.youtube.com/embed/ZJw-nqtDrWc' />
      <h2 className='mb-10 mt-5 text-[32px]'>{t('regexp.linkName')}</h2>
      {links.map(({ link, label }, idx) => (
        <Link
          key={link}
          href={link}
          target='_blank'
          rel='noreferrer'
          className={clsxm(
            'block text-[16px] text-white',
            idx !== 0 && 'text-red-600',
          )}
        >
          {label}
        </Link>
      ))}
    </Container>
  );
}

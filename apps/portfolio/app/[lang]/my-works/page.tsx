'use client';
import { DefaultProps } from '@app/types';
import { Container } from '@components/Container';
import { useTranslation } from '@i18n/client';

import { works } from './constants';
import { WorkItem } from './WorkItem';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);

  return (
    <Container backText={t('ivan')} title={t('myWorks.myWorks')}>
      <p>{t('myWorks.description')}</p>
      <nav className='relative mx-auto flex max-w-[1200] flex-wrap justify-around transition-all duration-300 ease-out'>
        {works.map((item) => (
          <WorkItem item={item} key={item.id} />
        ))}
      </nav>
    </Container>
  );
}

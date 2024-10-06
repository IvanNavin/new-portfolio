'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import IMG from '@assets/img/minerFront.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { useTranslation } from '@i18n/client';
import Image from 'next/image';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);

  return (
    <Container
      lang={lang}
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks(lang)}
      title={t('works.miner.title')}
    >
      <Image
        priority={true}
        src={IMG}
        alt={t('works.english.title')}
        className='mb-6 max-h-[500px] object-contain'
      />
      <p>{t('works.miner.text')}</p>
      <footer>
        <Button
          text='See the result here'
          href='https://ivannavin.github.io/miner'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/miner'
        />
      </footer>
    </Container>
  );
}

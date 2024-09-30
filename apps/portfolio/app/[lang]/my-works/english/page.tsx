'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { roboto } from '@assets/fonts';
import IMG from '@assets/img/English.jpg';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
import Image from 'next/image';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);
  const textLines = Object.values(
    t('works.english.text', { returnObjects: true }),
  );

  return (
    <Container
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks()}
      title={t('works.english.title')}
    >
      <Image
        src={IMG}
        alt={t('works.english.title')}
        className='mb-6 max-h-[500px] object-contain'
      />
      <section className={roboto.className}>
        {textLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>
      <section className={clsxm(roboto.className, 'mt-6')}>
        <p>{t('works.english.login')}</p>
        <p>{t('works.english.password')}</p>
      </section>
      <footer>
        <Button
          text='See the result here'
          href='https://learn-english-card.netlify.app/'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/EnglishLearn/'
        />
      </footer>
    </Container>
  );
}

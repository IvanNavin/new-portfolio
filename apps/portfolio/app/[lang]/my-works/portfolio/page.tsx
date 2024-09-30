'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import IMG from '@assets/img/portfolio.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { useTranslation } from '@i18n/client';
import Image from 'next/image';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);
  const textLines = Object.values(
    t('works.portfolio.text', { returnObjects: true }),
  );

  return (
    <Container
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks()}
      title='Portfolio'
    >
      <Image
        src={IMG}
        alt={t('works.english.title')}
        className='mb-6 max-h-[500px] object-contain'
      />
      <section>
        {textLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      <footer>
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/portfolio'
        />
      </footer>
    </Container>
  );
}

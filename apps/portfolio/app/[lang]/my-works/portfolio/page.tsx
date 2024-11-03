'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import IMG from '@assets/img/portfolio.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { RenderTextArea } from '@components/RenderTextArea';
import { useTranslation } from '@i18n/client';
import Image from 'next/image';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);

  return (
    <Container
      lang={lang}
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks(lang)}
      title='Portfolio'
    >
      <Image
        priority={true}
        src={IMG}
        alt={t('works.english.title')}
        className='mb-6 max-h-[500px] object-contain'
      />
      <section>
        <RenderTextArea t={t} tKey='works.portfolio.text' />
      </section>

      <footer>
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/new-portfolio'
        />
      </footer>
    </Container>
  );
}

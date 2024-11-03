'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { roboto } from '@assets/fonts';
import IMG from '@assets/img/English.png';
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
      title={t('works.english.title')}
    >
      <Image
        priority={true}
        src={IMG}
        alt={t('works.english.title')}
        className='mb-6 max-h-[500px] object-contain'
      />
      <section className={roboto.className}>
        <RenderTextArea t={t} tKey='works.english.text' />
      </section>
      <footer>
        <Button
          text='See the result here'
          href='https://my-learning-language.vercel.app/'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/new-portfolio/tree/main/apps/language'
        />
      </footer>
    </Container>
  );
}

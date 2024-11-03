'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { roboto } from '@assets/fonts';
import VIDEO from '@assets/video/effectThanos.mp4';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { RenderTextArea } from '@components/RenderTextArea';
import { useTranslation } from '@i18n/client';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);

  return (
    <Container
      lang={lang}
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks(lang)}
      title='Thanos'
    >
      <video controls width='100%' autoPlay loop muted>
        <source src={VIDEO} type='video/mp4' />
        Your browser does not support the video tag.
      </video>
      <section className={roboto.className}>
        <RenderTextArea t={t} tKey='works.thanos.text' />
      </section>

      <footer>
        <Button
          text='See the result here'
          href='https://destructurizator.netlify.app/'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/new-portfolio/tree/main/apps/destructurizator'
        />
      </footer>
    </Container>
  );
}

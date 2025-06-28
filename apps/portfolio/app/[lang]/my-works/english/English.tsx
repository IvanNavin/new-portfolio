'use client';
import { ROUTES } from '@app/constants/routes';
import { roboto } from '@assets/fonts';
import IMG from '@assets/img/English.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { RenderTextArea } from '@components/RenderTextArea';
import { SafeIframe } from '@components/SafeIframe';
import { useTranslation } from '@i18n/client';

type Props = {
  lang: string;
  isIframeAvailable: boolean;
};
export const English = ({ lang, isIframeAvailable }: Props) => {
  const { t } = useTranslation();

  return (
    <Container
      lang={lang}
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks(lang)}
      title={t('works.english.title')}
    >
      <SafeIframe
        // iframeSrc='https://my-learning-language.vercel.app/'
        iframeSrc='https://localhost:3001'
        imgSrc={IMG}
        isIframeAvailable={isIframeAvailable}
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
};

'use client';
import { ROUTES } from '@app/constants/routes';
import IMG from '@assets/img/2048.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { SafeIframe } from '@components/SafeIframe';
import { useTranslation } from '@i18n/client';

type Props = {
  lang: string;
  isIframeAvailable: boolean;
};

export const Game2048 = ({ lang, isIframeAvailable }: Props) => {
  const { t } = useTranslation();

  return (
    <Container
      lang={lang}
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks(lang)}
      title={t('works.miner.title')}
    >
      <SafeIframe
        iframeSrc='https://2048-native.netlify.app/'
        imgSrc={IMG}
        isIframeAvailable={isIframeAvailable}
      />

      <footer>
        <Button
          text='See the result here'
          href='https://2048-native.netlify.app/'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/new-portfolio/tree/main/apps/2048'
        />
      </footer>
    </Container>
  );
};

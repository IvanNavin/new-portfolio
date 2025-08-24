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

      <div>
        <p className='my-4'>{t('works.2048.title')}</p>
        <p>{t('works.2048.description')}</p>
        <p className='my-4'>{t('works.2048.features')}</p>
        <ul className='list-disc'>
          <li>{t('works.2048.li1')}</li>
          <li>{t('works.2048.li2')}</li>
          <li>{t('works.2048.li3')}</li>
          <li>{t('works.2048.li4')}</li>
        </ul>
      </div>

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

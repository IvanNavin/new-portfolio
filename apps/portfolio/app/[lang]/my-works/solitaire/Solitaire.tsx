'use client';
import { ROUTES } from '@app/constants/routes';
import IMG from '@assets/img/solitaireFront.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { SafeIframe } from '@components/SafeIframe';
import { useTranslation } from '@i18n/client';

type Props = {
  lang: string;
  isIframeAvailable: boolean;
};

export const Solitaire = ({ lang, isIframeAvailable }: Props) => {
  const { t } = useTranslation();

  return (
    <Container
      lang={lang}
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks(lang)}
      title='Solitaire'
    >
      <SafeIframe
        iframeSrc='https://solitare-native.netlify.app/'
        imgSrc={IMG}
        isIframeAvailable={isIframeAvailable}
      />

      <div>
        <p className='my-4'>{t('works.solitaire.title')}</p>
        <p>{t('works.solitaire.description')}</p>
        <p className='my-4'>{t('works.solitaire.features')}</p>
        <ul className='list-disc'>
          <li>{t('works.solitaire.li1')}</li>
          <li>{t('works.solitaire.li2')}</li>
          <li>{t('works.solitaire.li3')}</li>
          <li>{t('works.solitaire.li4')}</li>
        </ul>
      </div>

      <footer className='mt-6'>
        <Button
          text='See the result here'
          href='https://solitare-native.netlify.app/'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/new-portfolio/tree/main/apps/solitaire'
        />
      </footer>
    </Container>
  );
};

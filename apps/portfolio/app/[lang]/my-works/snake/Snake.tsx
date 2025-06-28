'use client';

import { ROUTES } from '@app/constants/routes';
import IMG from '@assets/img/snake-front.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { SafeIframe } from '@components/SafeIframe';
import { useTranslation } from '@i18n/client';

type Props = {
  lang: string;
  isIframeAvailable: boolean;
};

export const Snake = ({ lang, isIframeAvailable }: Props) => {
  const { t } = useTranslation();

  return (
    <Container
      lang={lang}
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks(lang)}
      title='Snake'
    >
      <SafeIframe
        iframeSrc='https://snake-native.vercel.app/'
        imgSrc={IMG}
        isIframeAvailable={isIframeAvailable}
      />

      <div>
        <p className='my-4'>{t('works.snake.title')}</p>
        <p>{t('works.snake.description')}</p>
        <p className='my-4'>{t('works.snake.features')}</p>
        <ul className='list-disc'>
          <li>{t('works.snake.li1')}</li>
          <li>{t('works.snake.li2')}</li>
          <li>{t('works.snake.li3')}</li>
          <li>{t('works.snake.li4')}</li>
        </ul>
      </div>

      <footer className='mt-6'>
        <Button
          text='See the result here'
          href='https://snake-native.vercel.app/'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/new-portfolio/tree/main/apps/snake'
        />
      </footer>
    </Container>
  );
};

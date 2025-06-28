'use client';
import { ROUTES } from '@app/constants/routes';
import IMG from '@assets/img/ganttChartFront.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { SafeIframe } from '@components/SafeIframe';
import { useTranslation } from '@i18n/client';

type Props = {
  lang: string;
  isIframeAvailable: boolean;
};

export const GantChart = ({ lang, isIframeAvailable }: Props) => {
  const { t } = useTranslation();

  return (
    <Container
      lang={lang}
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks(lang)}
      title='Gantt Chart'
    >
      <SafeIframe
        iframeSrc='https://gantt-chart-test.vercel.app/'
        imgSrc={IMG}
        isIframeAvailable={isIframeAvailable}
      />

      <p>{t('works.ganttChart.text')}</p>
      <footer>
        <Button
          text='See the result here'
          href='https://gantt-chart-test.vercel.app/'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/new-portfolio/tree/main/apps/gantt-chart'
        />
      </footer>
    </Container>
  );
};

'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import IMG from '@assets/img/ganttChartFront.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { useTranslation } from '@i18n/client';
import Image from 'next/image';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);

  return (
    <Container
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks()}
      title='Gantt Chart'
    >
      <Image
        src={IMG}
        alt={t('works.english.title')}
        className='mb-6 max-h-[500px] object-contain'
      />
      <p>{t('works.ganttChart.text')}</p>
      <footer>
        <Button
          text='See the result here'
          href='https://ganttchart777.netlify.app'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/GanttChart'
        />
      </footer>
    </Container>
  );
}

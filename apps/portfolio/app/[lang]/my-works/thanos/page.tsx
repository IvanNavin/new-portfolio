'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { roboto } from '@assets/fonts';
import VIDEO from '@assets/video/effectThanos.mp4';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { useTranslation } from '@i18n/client';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);
  const textLines = Object.values(
    t('works.thanos.text', { returnObjects: true }),
  );
  return (
    <Container
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks()}
      title='Thanos'
    >
      <video controls width='100%' autoPlay loop muted>
        <source src={VIDEO} type='video/mp4' />
        Your browser does not support the video tag.
      </video>
      <section className={roboto.className}>
        {textLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      <footer>
        <Button
          text='See the result here'
          href='https://destructurizator.netlify.app/'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/destructurizator'
        />
      </footer>
    </Container>
  );
}

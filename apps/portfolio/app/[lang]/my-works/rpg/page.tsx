'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import VIDEO from '@assets/video/game_js_pro.mp4';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { useTranslation } from '@i18n/client';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);
  const textLines = Object.values(t('works.rpg.text', { returnObjects: true }));

  return (
    <Container
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks()}
      title='RPG'
    >
      <video controls width='100%' autoPlay loop>
        <source src={VIDEO} type='video/mp4' />
        Your browser does not support the video tag.
      </video>
      <section>
        {textLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      <footer>
        <Button
          text='See the result here'
          href='https://quest-world.herokuapp.com/'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/js-pro-game'
        />
      </footer>
    </Container>
  );
}

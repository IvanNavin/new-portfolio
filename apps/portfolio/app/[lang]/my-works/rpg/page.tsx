'use client';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { RenderTextArea } from '@components/RenderTextArea';
import { useTranslation } from '@i18n/client';
import { use } from 'react';

const VIDEO = '/video/game_js_pro.mp4';

export default function Page({ params }: DefaultProps) {
  const { lang } = use(params);
  const { t } = useTranslation();

  return (
    <Container
      lang={lang}
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks(lang)}
      title='RPG'
    >
      <video controls width='100%' autoPlay loop>
        <source src={VIDEO} type='video/mp4' />
        Your browser does not support the video tag.
      </video>
      <section>
        <RenderTextArea t={t} tKey='works.rpg.text' />
      </section>

      <footer>
        <Button
          text='See the result here'
          href='https://rpg-game-b89w.onrender.com'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/new-portfolio/tree/main/apps/rpg-game'
        />
      </footer>
    </Container>
  );
}

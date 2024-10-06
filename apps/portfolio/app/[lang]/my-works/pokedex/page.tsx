'use client';
import { stack } from '@app/[lang]/my-works/pokedex/constants';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { roboto } from '@assets/fonts';
import IMG from '@assets/img/pokedex-home.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { VideoFrame } from '@components/VideoFrame';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
import Image from 'next/image';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);
  const textLines = Object.values(
    t('works.pokedex.text', { returnObjects: true }),
  );
  const secondTextLines = Object.values(
    t('works.pokedex.secondText', { returnObjects: true }),
  );
  const thirdTextLines = Object.values(
    t('works.pokedex.thirdText', { returnObjects: true }),
  );
  const fourthTextLines = Object.values(
    t('works.pokedex.fourText', { returnObjects: true }),
  );

  return (
    <Container
      lang={lang}
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks(lang)}
      title='Pokedex'
    >
      <Image
        priority={true}
        src={IMG}
        alt={t('works.english.title')}
        className='mb-6 max-h-[500px] object-contain'
      />
      <div className={clsxm(roboto.className, 'flex flex-col gap-y-6')}>
        <section>
          {textLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <ul className='ml-6 list-disc'>
            {stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          {secondTextLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
        <section>
          {thirdTextLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
        <VideoFrame src='https://www.youtube.com/embed/3QXCrih6_MI' />
        <section>
          {fourthTextLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
      </div>

      <footer>
        <Button
          text='See the result here'
          href='https://pokedex777.vercel.app/'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/Pokedex777'
        />
      </footer>
    </Container>
  );
}

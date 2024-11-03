'use client';
import { stack } from '@app/[lang]/my-works/pokedex/constants';
import { ROUTES } from '@app/constants/routes';
import { DefaultProps } from '@app/types';
import { roboto } from '@assets/fonts';
import IMG from '@assets/img/pokedex-home.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { RenderTextArea } from '@components/RenderTextArea';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
import Image from 'next/image';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);

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
          <RenderTextArea t={t} tKey='works.pokedex.text' />
          <ul className='ml-6 list-disc'>
            {stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <RenderTextArea t={t} tKey='works.pokedex.secondText' />
        </section>
        <section>
          <RenderTextArea t={t} tKey='works.pokedex.thirdText' />
        </section>
        <section>
          <RenderTextArea t={t} tKey='works.pokedex.fourText' />
        </section>
      </div>

      <footer>
        <Button
          text='See the result here'
          href='https://pokedex-pedia.vercel.app'
        />
        <Button
          text='See the code here'
          href='https://github.com/IvanNavin/new-portfolio/tree/main/apps/pokedex'
        />
      </footer>
    </Container>
  );
}

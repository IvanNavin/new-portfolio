'use client';
import { stack } from '@app/[lang]/my-works/pokedex/constants';
import { ROUTES } from '@app/constants/routes';
import { roboto } from '@assets/fonts';
import IMG from '@assets/img/solitaireFront.png';
import { Button } from '@components/Button';
import { Container } from '@components/Container';
import { RenderTextArea } from '@components/RenderTextArea';
import { SafeIframe } from '@components/SafeIframe';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';

type Props = {
  lang: string;
  isIframeAvailable: boolean;
};
export const Pokedex = ({ lang, isIframeAvailable }: Props) => {
  const { t } = useTranslation();

  return (
    <Container
      lang={lang}
      backText={t('myWorks.myWorks')}
      backPath={ROUTES.myWorks(lang)}
      title='Pokedex'
    >
      <SafeIframe
        iframeSrc='https://pokedex-pedia.vercel.app/pokedex'
        imgSrc={IMG}
        isIframeAvailable={isIframeAvailable}
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
};

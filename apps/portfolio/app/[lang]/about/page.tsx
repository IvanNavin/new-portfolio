'use client';
import { DefaultProps } from '@app/types';
import { randomCount } from '@app/utils/randomize';
import { roboto, russoOne } from '@assets/fonts';
import { Container } from '@components/Container';
import { Css, EmptyGear, Html, Js } from '@components/svg';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
import { useIsClient } from 'usehooks-ts';

import './style.css';

import { cssSkills, htmlSkills, JSSkills, otherSkills } from './constants';
import { DownloadButton } from './DownloadButton';

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation(lang);
  const textLines = Object.values(t('about.text', { returnObjects: true }));
  const isClient = useIsClient();
  const factsLines = randomCount(
    Object.values(t('about.facts', { returnObjects: true })),
  );

  return (
    <Container backText={t('ivan')} title={t('about.helloThere')}>
      <section className={roboto.className}>
        {textLines.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </section>
      <section
        className={clsxm(
          roboto.className,
          'mx-auto my-6 flex max-w-[672px] flex-col items-center',
        )}
      >
        <div className='m-2 w-[320px] self-start'>
          <Html className='mx-auto mb-2' />
          <ul className='flex flex-wrap justify-center gap-2'>
            {htmlSkills.map((skill) => (
              <li key={skill}>{`#${skill}`}</li>
            ))}
          </ul>
        </div>
        <div className='m-2 w-[320px] self-end'>
          <Css className='mx-auto mb-2' />

          <ul className='flex flex-wrap justify-center gap-2'>
            {cssSkills.map((skill) => (
              <li key={skill}>{`#${skill}`}</li>
            ))}
          </ul>
        </div>
        <div className='m-2 w-[320px] self-start'>
          <Js className='mx-auto mb-2' />
          <ul className='flex flex-wrap justify-center gap-2'>
            {JSSkills.map((skill) => (
              <li key={skill}>{`#${skill}`}</li>
            ))}
          </ul>
        </div>
        <div className='m-2 w-[320px] self-end'>
          <div className='relative mx-auto mb-2 size-[100px]'>
            <div
              className={clsxm(
                russoOne.className,
                'flex items-center justify-center',
                'absolute left-1/2 top-1/2 size-[47px] rounded-full bg-white',
                '-translate-x-1/2 -translate-y-1/2 text-black',
                "before:content-['{_OTHER_}'] text-[9px]",
              )}
            />
            <EmptyGear />
          </div>
          <ul className='flex flex-wrap justify-center gap-2'>
            {otherSkills.map((skill) => (
              <li key={skill}>{`#${skill}`}</li>
            ))}
          </ul>
        </div>
      </section>
      <p className={roboto.className}>{t('about.description')}</p>
      <h2 className='mb-10 mt-5 text-right text-[32px]'>
        {t('about.randomFacts')}
      </h2>
      <ul className='text-right'>
        {isClient &&
          factsLines.map((line, index) => <li key={index}>{line}</li>)}
      </ul>
      <DownloadButton />
    </Container>
  );
}

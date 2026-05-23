'use client';
import { DefaultProps } from '@app/types';
import { roboto, russoOne } from '@assets/fonts';
import { Container } from '@components/Container';
import { Magnetic } from '@components/Magnetic';
import { RenderTextArea } from '@components/RenderTextArea';
import { Css, EmptyGear, Html, Js } from '@components/svg';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
import { use } from 'react';

import './style.css';

import { AchievementRings } from './AchievementRings';
import { CareerTimeline } from './CareerTimeline';
import {
  achievementRings,
  careerTimeline,
  cssSkills,
  htmlSkills,
  JSSkills,
  otherSkills,
} from './constants';
import { DownloadButton } from './DownloadButton';

export default function Page({ params }: DefaultProps) {
  const { lang } = use(params);
  const { t } = useTranslation();

  return (
    <Container lang={lang} backText={t('ivan')} title={t('about.helloThere')}>
      <section className={roboto.className}>
        <RenderTextArea t={t} tKey='about.text' />
      </section>
      <AchievementRings rings={achievementRings} />
      <CareerTimeline title={t('about.careerTitle')} entries={careerTimeline} />
      <section
        className={clsxm(
          roboto.className,
          'mx-auto my-10 flex max-w-[672px] flex-col items-center',
        )}
      >
        <Magnetic>
          <div className='m-2 w-[320px] self-start'>
            <Html className='mx-auto mb-2' />
            <ul className='flex flex-wrap justify-center gap-2'>
              {htmlSkills.map((skill) => (
                <li key={skill}>{`#${skill}`}</li>
              ))}
            </ul>
          </div>
        </Magnetic>

        <Magnetic>
          <div className='m-2 w-[320px] self-end'>
            <Css className='mx-auto mb-2' />

            <ul className='flex flex-wrap justify-center gap-2'>
              {cssSkills.map((skill) => (
                <li key={skill}>{`#${skill}`}</li>
              ))}
            </ul>
          </div>
        </Magnetic>

        <Magnetic>
          <div className='m-2 w-[320px] self-start'>
            <Js className='mx-auto mb-2' />
            <ul className='flex flex-wrap justify-center gap-2'>
              {JSSkills.map((skill) => (
                <li key={skill}>{`#${skill}`}</li>
              ))}
            </ul>
          </div>
        </Magnetic>

        <Magnetic>
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
        </Magnetic>
      </section>

      <DownloadButton />
    </Container>
  );
}

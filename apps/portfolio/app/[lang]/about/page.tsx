'use client';
import { DefaultProps } from '@app/types';
import { roboto, russoOne } from '@assets/fonts';
import { Container } from '@components/Container';
import { RenderTextArea } from '@components/RenderTextArea';
import { Css, EmptyGear, Html, Js } from '@components/svg';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
import { use } from 'react';

import './style.css';

import { AchievementRings } from './AchievementRings';
import { CareerTimeline } from './CareerTimeline';
import {
  buildAchievementRings,
  buildCareerTimeline,
  cssSkills,
  htmlSkills,
  JSSkills,
  otherSkills,
} from './constants';
import { DownloadButton } from './DownloadButton';
import { PerformanceRings } from './PerformanceRings';
import { SkillBlock, SkillsSection } from './SkillsSection';

// Four skill blocks alternating left/right — the SkillsSection slides
// each one in from its own side and rolls the inner hashtags in as a
// sine-wave. The Other-block icon is the only non-trivial one (custom
// circle inside a gear), so it stays inlined here as JSX.
const buildSkillBlocks = (): SkillBlock[] => [
  {
    side: 'left',
    icon: <Html className='mx-auto mb-2' />,
    skills: htmlSkills,
  },
  {
    side: 'right',
    icon: <Css className='mx-auto mb-2' />,
    skills: cssSkills,
  },
  {
    side: 'left',
    icon: <Js className='mx-auto mb-2' />,
    skills: JSSkills,
  },
  {
    side: 'right',
    icon: (
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
    ),
    skills: otherSkills,
  },
];

export default function Page({ params }: DefaultProps) {
  const { lang } = use(params);
  const { t } = useTranslation();
  const achievementRings = buildAchievementRings(t);
  const careerTimeline = buildCareerTimeline(t);
  const skillBlocks = buildSkillBlocks();

  return (
    <Container lang={lang} backText={t('ivan')} title={t('about.helloThere')}>
      <section className={roboto.className}>
        <RenderTextArea t={t} tKey='about.text' />
      </section>
      <AchievementRings
        rings={achievementRings}
        ariaLabel={t('about.achievementsAriaLabel')}
      />
      <CareerTimeline
        title={t('about.careerTitle')}
        ariaLabel={t('about.careerAriaLabel')}
        nowLabel={t('about.now')}
        entries={careerTimeline}
      />
      <SkillsSection blocks={skillBlocks} />

      <PerformanceRings
        t={t}
        title={t('about.perfTitle')}
        subtitle={t('about.perfSubtitle')}
      />

      <DownloadButton lang={lang} />
    </Container>
  );
}

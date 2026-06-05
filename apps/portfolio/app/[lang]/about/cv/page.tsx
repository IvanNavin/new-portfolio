'use client';
import { DefaultProps } from '@app/types';
import { russoOne } from '@assets/fonts';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
import { use } from 'react';

import {
  buildCareerTimeline,
  cssSkills,
  htmlSkills,
  JSSkills,
  otherSkills,
  yearsOfExperience,
} from '../constants';

import './style.css';

import { CV_CONTACTS } from './contacts';
import { CVToolbar } from './CVToolbar';

export default function CVPage({ params }: DefaultProps) {
  const { lang } = use(params);
  const { t } = useTranslation();
  const career = buildCareerTimeline(t);

  // Summary uses the first two paragraphs of the About intro — they
  // already read like a CV summary. The playful "Outside work" line
  // (line5) is intentionally skipped here.
  const summaryLines = [t('about.text.line1'), t('about.text.line3')];

  return (
    <main className='cv-page' lang={lang}>
      <header className='cv-header'>
        <h1 className={clsxm(russoOne.className, 'cv-header__name')}>
          Ivan Holovko
        </h1>
        <p className='cv-header__role'>
          {t('cv.role')} · {yearsOfExperience}+ {t('about.rings.experience')}
        </p>
        <div className='cv-header__contacts'>
          {CV_CONTACTS.map((c) =>
            c.href ? (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel='noopener noreferrer'
                className='cv-header__contact-link'
              >
                <span aria-hidden='true'>{c.icon}</span>
                <span>{c.value}</span>
              </a>
            ) : (
              <span key={c.label} className='cv-header__contact-link'>
                <span aria-hidden='true'>{c.icon}</span>
                <span>{c.value}</span>
              </span>
            ),
          )}
        </div>
      </header>

      <section className='cv-section cv-summary'>
        <h2 className='cv-section__heading'>{t('cv.summary')}</h2>
        {summaryLines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </section>

      <section className='cv-section'>
        <h2 className='cv-section__heading'>{t('cv.experience')}</h2>
        {career.map((entry, i) => (
          <article key={`${entry.company}-${i}`} className='cv-entry'>
            <div className='cv-entry__head'>
              <span className='cv-entry__role'>{entry.role}</span>
              <span className='cv-entry__company'>· {entry.company}</span>
              <span className='cv-entry__period'>{entry.period}</span>
            </div>
            {(entry.companySubtitle || entry.location || entry.workMode) && (
              <div className='cv-entry__meta'>
                {entry.companySubtitle && <span>{entry.companySubtitle}</span>}
                {entry.companySubtitle && entry.location && (
                  <span className='cv-entry__meta-dot'>·</span>
                )}
                {entry.location && <span>{entry.location}</span>}
                {entry.location && entry.workMode && (
                  <span className='cv-entry__meta-dot'>·</span>
                )}
                {entry.workMode && <span>{entry.workMode}</span>}
              </div>
            )}
            {entry.bullets.length > 0 && (
              <ul className='cv-entry__bullets'>
                {entry.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
            {entry.stack && entry.stack.length > 0 && (
              <div className='cv-entry__stack'>
                {entry.stack.map((s) => (
                  <span key={s} className='cv-entry__stack-item'>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>

      <section className='cv-section'>
        <h2 className='cv-section__heading'>{t('cv.skills')}</h2>
        <div className='cv-skills__group'>
          <p className='cv-skills__title'>HTML</p>
          <p className='cv-skills__list'>{htmlSkills.join(' · ')}</p>
        </div>
        <div className='cv-skills__group'>
          <p className='cv-skills__title'>CSS</p>
          <p className='cv-skills__list'>{cssSkills.join(' · ')}</p>
        </div>
        <div className='cv-skills__group'>
          <p className='cv-skills__title'>JavaScript</p>
          <p className='cv-skills__list'>{JSSkills.join(' · ')}</p>
        </div>
        <div className='cv-skills__group'>
          <p className='cv-skills__title'>Tooling</p>
          <p className='cv-skills__list'>{otherSkills.join(' · ')}</p>
        </div>
      </section>

      <CVToolbar
        labels={{
          print: t('cv.print'),
          share: t('cv.share'),
          copyLink: t('cv.copyLink'),
          copied: t('cv.copied'),
          scanHint: t('cv.scanHint'),
          downloadPdf: t('cv.downloadPdf'),
        }}
      />
    </main>
  );
}

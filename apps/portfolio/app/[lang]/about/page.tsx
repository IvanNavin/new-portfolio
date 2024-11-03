'use client';
import { DefaultProps } from '@app/types';
import { roboto, russoOne } from '@assets/fonts';
import { Container } from '@components/Container';
import { Magnetic } from '@components/Magnetic';
import { RenderTextArea } from '@components/RenderTextArea';
import { Css, EmptyGear, Html, Js } from '@components/svg';
import { useTranslation } from '@i18n/client';
import { clsxm } from '@repo/utils';
import { useEffect, useState } from 'react';
import { useIsClient } from 'usehooks-ts';

import './style.css';

import { cssSkills, htmlSkills, JSSkills, otherSkills } from './constants';
import { DownloadButton } from './DownloadButton';

const factsPerPage = 4;

export default function Page({ params: { lang } }: DefaultProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useTranslation(lang);
  const isClient = useIsClient();
  const allFacts: string[] = Object.values(
    t('about.facts', { returnObjects: true }),
  );

  const pages = [];
  for (let i = 0; i < allFacts.length; i += factsPerPage) {
    pages.push(allFacts.slice(i, i + factsPerPage));
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentPage((prevPage) => {
        const isLastPage = prevPage === pages.length - 1;
        return isLastPage ? 0 : prevPage + 1;
      });
    }, 7000); // Facts change every 7 seconds

    return () => clearInterval(intervalId);
  }, [pages.length]);

  // Select the facts to display on the current page
  const currentFacts =
    currentPage === pages.length - 1 && pages[currentPage].length < factsPerPage
      ? [
          ...pages[currentPage],
          ...pages[currentPage - 1].slice(
            0,
            factsPerPage - pages[currentPage].length,
          ),
        ]
      : pages[currentPage];

  return (
    <Container lang={lang} backText={t('ivan')} title={t('about.helloThere')}>
      <section className={roboto.className}>
        <RenderTextArea t={t} tKey='about.text' />
      </section>
      <section
        className={clsxm(
          roboto.className,
          'mx-auto my-6 flex max-w-[672px] flex-col items-center',
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
      <p className={roboto.className}>{t('about.description')}</p>
      <h2 className='mb-6 mt-5 text-right text-[32px]'>{t('about.whoIAm')}</h2>
      <ul className='mb-6 text-right'>
        {isClient &&
          currentFacts.map((line, index) => <li key={index}>{line}</li>)}
      </ul>
      <DownloadButton />
    </Container>
  );
}

import CV from '@assets/cv/Ivan_Holovko_CV.pdf';
import { Magnetic } from '@components/Magnetic';
import { clsxm } from '@repo/utils';
import Link from 'next/link';
import React from 'react';

export const DownloadButton = () => {
  return (
    <Magnetic>
      <Link
        href={CV}
        download='CV_Holovko_Ivan.pdf'
        className={clsxm(
          'download text-gold relative inline-block cursor-pointer ',
          'overflow-hidden bg-transparent px-6 py-7 text-2xl uppercase tracking-wider',
        )}
      >
        <span className='absolute left-0 top-0 h-0.5 w-full animate-animate1 bg-gradient-to-r from-[#0c002b] to-yellow-500' />
        <span className='absolute right-0 top-0 h-full w-0.5 animate-animate2 bg-gradient-to-b from-[#0c002b] to-yellow-500' />
        <span className='absolute bottom-0 left-0 h-0.5 w-full animate-animate3 bg-gradient-to-l from-[#0c002b] to-yellow-500' />
        <span className='absolute left-0 top-0 h-full w-0.5 animate-animate4 bg-gradient-to-t from-[#0c002b] to-yellow-500' />
        <span className='star-blink'>
          <div />
        </span>
        <b>Download CV</b>
      </Link>
    </Magnetic>
  );
};

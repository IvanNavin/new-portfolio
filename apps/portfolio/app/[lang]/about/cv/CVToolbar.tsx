'use client';
import { Magnetic } from '@components/Magnetic';
import { clsxm } from '@repo/utils';
import { ReactNode, useState } from 'react';

import { QRPopover } from './QRPopover';

type Props = {
  labels: {
    print: string;
    share: string;
    copyLink: string;
    copied: string;
    scanHint: string;
    downloadPdf: string;
  };
};

const CV_PDF_PATH = '/cv/Ivan_Holovko_CV.pdf';

/**
 * Inner pieces shared between every action button — the 4 animated
 * border lines + the star-blink decoration. Pulled out so each
 * button stays a thin shell that just supplies its own label and
 * trigger.
 */
const AnimatedFx = ({ children }: { children: ReactNode }) => (
  <>
    <span className='absolute left-0 top-0 h-0.5 w-full animate-animate1 bg-gradient-to-r from-[#0c002b] to-yellow-500' />
    <span className='absolute right-0 top-0 h-full w-0.5 animate-animate2 bg-gradient-to-b from-[#0c002b] to-yellow-500' />
    <span className='absolute bottom-0 left-0 h-0.5 w-full animate-animate3 bg-gradient-to-l from-[#0c002b] to-yellow-500' />
    <span className='absolute left-0 top-0 h-full w-0.5 animate-animate4 bg-gradient-to-t from-[#0c002b] to-yellow-500' />
    <span className='star-blink'>
      <div />
    </span>
    <b className='relative z-10'>{children}</b>
  </>
);

const BTN_CLASS = clsxm(
  'text-gold relative inline-block cursor-pointer overflow-hidden',
  'bg-transparent px-6 py-4 text-base uppercase tracking-widest',
);

/**
 * CV action bar that reuses the same animated-border + star-blink
 * pattern as the About page's "Read full CV" button — same visual
 * language across the site instead of one-off styles. Each button
 * is also wrapped in <Magnetic> for the cursor-pull effect.
 *
 * Hidden from print via the global `[data-print-hide]` rule.
 */
export const CVToolbar = ({ labels }: Props) => {
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const openShare = () => {
    setShareUrl(typeof window !== 'undefined' ? window.location.href : '');
    setShowShare(true);
  };

  return (
    <>
      <div
        data-print-hide=''
        className='cv-toolbar'
        role='toolbar'
        aria-label='CV actions'
      >
        <Magnetic>
          <button
            type='button'
            onClick={() => window.print()}
            className={BTN_CLASS}
          >
            <AnimatedFx>{labels.print}</AnimatedFx>
          </button>
        </Magnetic>

        <Magnetic>
          <button
            type='button'
            onClick={openShare}
            className={BTN_CLASS}
            aria-haspopup='dialog'
            aria-expanded={showShare}
          >
            <AnimatedFx>{labels.share}</AnimatedFx>
          </button>
        </Magnetic>

        <Magnetic>
          <a
            href={CV_PDF_PATH}
            target='_blank'
            rel='noopener noreferrer'
            className={BTN_CLASS}
          >
            <AnimatedFx>{labels.downloadPdf}</AnimatedFx>
          </a>
        </Magnetic>
      </div>

      {showShare && (
        <QRPopover
          url={shareUrl}
          labels={{
            copyLink: labels.copyLink,
            copied: labels.copied,
            scanHint: labels.scanHint,
          }}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
};

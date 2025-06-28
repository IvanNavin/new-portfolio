import { Preloader } from '@components/preloader';
import { clsxm } from '@repo/utils';
import { StaticImageData } from 'next/image';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
  imgSrc: string | StaticImageData;
  iframeSrc: string;
  isIframeAvailable: boolean;
};

export const SafeIframe = ({ imgSrc, iframeSrc, isIframeAvailable }: Props) => {
  const [showContent, setShowContent] = useState(false);
  const [showImageOverlay, setShowImageOverlay] = useState(false);

  useEffect(() => {
    if (!isIframeAvailable) return;

    const timer = setTimeout(() => {
      setShowContent(true);

      const imgTimer = setTimeout(() => {
        setShowImageOverlay(true);
      }, 200);

      return () => clearTimeout(imgTimer);
    }, 200);

    return () => clearTimeout(timer);
  }, [isIframeAvailable]);

  if (!isIframeAvailable) {
    return (
      <div className='relative aspect-video w-full'>
        <Image
          fill
          priority
          src={imgSrc}
          alt='Image work'
          className='object-cover'
        />
      </div>
    );
  }

  return (
    <div className='relative aspect-video w-full overflow-hidden rounded-lg'>
      {!showContent && (
        <div className='flex size-full items-center justify-center'>
          <Preloader />
        </div>
      )}

      {showContent && (
        <iframe
          src={iframeSrc}
          className={clsxm(
            'absolute inset-0 w-full h-full border-none',
            'transition-opacity duration-500 z-10',
            showContent ? 'opacity-100' : 'opacity-0',
          )}
          allowFullScreen
        />
      )}

      {showImageOverlay && (
        <Image
          fill
          priority
          src={imgSrc}
          alt='Image overlay'
          className={clsxm(
            'object-cover transition-opacity duration-500 z-0',
            showImageOverlay ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  );
};

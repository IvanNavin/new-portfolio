import { clsxm } from '@repo/utils';
import Image, { StaticImageData } from 'next/image';

type Props = {
  imgSrc: string | StaticImageData;
  iframeSrc: string;
  isIframeAvailable: boolean;
};

export const SafeIframe = ({ imgSrc, iframeSrc, isIframeAvailable }: Props) => {
  return (
    <div className='relative aspect-video w-full'>
      <Image
        priority
        src={imgSrc}
        alt='Image work'
        fill
        objectFit='cover'
        className='z-0'
      />

      <iframe
        src={iframeSrc}
        className={clsxm(
          'size-full border-none z-10 absolute inset-0',
          !isIframeAvailable && 'hidden',
        )}
        allowFullScreen
      />
    </div>
  );
};

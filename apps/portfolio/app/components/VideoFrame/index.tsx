import { DetailedHTMLProps, IframeHTMLAttributes } from 'react';

export const VideoFrame = ({
  src,
  ...rest
}: DetailedHTMLProps<
  IframeHTMLAttributes<HTMLIFrameElement>,
  HTMLIFrameElement
>) => {
  return (
    <div className='relative h-0 w-full pb-[56.25%]'>
      <iframe
        src={src}
        title='YouTube video player'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
        className='absolute inset-0 size-full'
        {...rest}
      />
    </div>
  );
};

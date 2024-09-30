import LightDots from '@assets/img/light_dots.png';
import { clsxm } from '@repo/utils';
import Image from 'next/image';

export const RotateStar = () => {
  return (
    <>
      <Image
        src={LightDots}
        width={543}
        height={382}
        alt='light dots'
        priority={true}
        className={clsxm(
          'absolute left-1/2 top-1/2 brightness-200',
          'pointer-events-none animate-rotateStar',
        )}
      />
      <Image
        src={LightDots}
        width={543}
        height={382}
        alt='light dots'
        priority={true}
        className={clsxm(
          'absolute left-1/2 top-1/2 brightness-200 w-full',
          'pointer-events-none animate-reRotateStar',
        )}
      />
    </>
  );
};

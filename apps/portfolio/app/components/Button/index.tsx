import MONK from '@assets/img/monk.png';
import { clsxm } from '@repo/utils';
import Image from 'next/image';
import Link from 'next/link';
import { CSSProperties } from 'react';

type Props = {
  text: string;
  href: string;
  style?: CSSProperties;
  className?: string;
};

export const Button = ({ text, href, style, className }: Props) => {
  return (
    <Link
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className={clsxm(
        'inline-block size-[100px] relative text-white group',
        className,
      )}
    >
      <Image
        priority={true}
        src={MONK}
        alt='monk'
        className='absolute left-1/2 top-1/2 size-[30px] -translate-x-1/2 -translate-y-1/2'
      />
      <svg
        width={100}
        height={100}
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        viewBox='0 0 500 500'
        className='transition-transform duration-200 ease-linear group-hover:[transform:rotate3d(-1,1,1,-65deg)_scale(1.5)]'
      >
        <defs>
          <path
            id='textcircle'
            d='M50,250c0-110.5,89.5-200,200-200s200,89.5,200,200s-89.5,200-200,200S50,360.5,50,250'
          />
        </defs>
        <text
          dy='70'
          textLength='1220'
          className='origin-center animate-rotate fill-white text-[63px] uppercase tracking-[17px]'
          style={style}
        >
          <textPath xlinkHref='#textcircle'>{text}</textPath>
        </text>
      </svg>
    </Link>
  );
};

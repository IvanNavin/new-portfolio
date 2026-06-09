import { SVGProps } from 'react';

/**
 * Envelope icon. Stroke-based for visual harmony with the inline
 * site icons; sits on top of dark backgrounds with `fill='#fff'`
 * (default).
 */
export const Mail = ({
  width = 24,
  height = 24,
  stroke = '#fff',
  ...rest
}: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke={stroke}
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...rest}
    >
      <rect x='2.5' y='4.5' width='19' height='15' rx='2' />
      <path d='m3 6 9 7 9-7' />
    </svg>
  );
};

import { SVGProps } from 'react';

export const LinkedIn = ({
  width = 24,
  height = 24,
  fill = '#fff',
  ...rest
}: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 51 48'
      {...rest}
    >
      <path
        fill={fill}
        d='M29 21.562s3.26-6.355 10-5.875c6.74.48 11.655 4.877 12 14.688l-10-1.958s-1.052-4.13-5-3.917c-3.948.214-5.183.783-7 2.937-1.817 2.155 0-5.875 0-5.875zM2 17h10v31H2V17zm17 0h10v31H19V17zm22 11h10v20H41V28zM7 1a6 6 0 1 1 0 12A6 6 0 0 1 7 1z'
      />
    </svg>
  );
};

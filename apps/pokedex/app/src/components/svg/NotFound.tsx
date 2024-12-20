import { SVGProps } from 'react';

export const NotFound = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox='0 0 1307 672'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <g filter='url(#filter0_d)'>
        <path
          d='M332.6 109.8V397.5H411.7V468.2H332.6V569H250.7V468.2H20.4V405.9L252.8 109.8H332.6ZM118.4 405.9H254.9V232.3L118.4 405.9ZM646.509 105.6C674.509 105.6 699.942 110.5 722.809 120.3C746.142 129.633 765.975 144.1 782.309 163.7C817.775 205.233 835.509 264.733 835.509 342.2C835.509 419.667 817.775 479.167 782.309 520.7C749.642 559.433 704.609 578.8 647.209 578.8C589.342 578.8 543.842 559.433 510.709 520.7C475.709 480.1 458.209 420.6 458.209 342.2C458.209 263.8 475.709 204.3 510.709 163.7C543.842 124.967 589.109 105.6 646.509 105.6ZM750.109 342.2C750.109 289.933 741.009 250.033 722.809 222.5C705.075 194.5 679.642 180.5 646.509 180.5C613.842 180.5 588.409 194.5 570.209 222.5C552.475 250.033 543.609 289.933 543.609 342.2C543.609 394.467 552.475 434.367 570.209 461.9C588.409 488.967 613.842 502.5 646.509 502.5C679.642 502.5 705.075 488.967 722.809 461.9C741.009 434.367 750.109 394.467 750.109 342.2ZM1199.88 109.8V397.5H1278.98V468.2H1199.88V569H1117.98V468.2H887.677V405.9L1120.08 109.8H1199.88ZM985.677 405.9H1122.18V232.3L985.677 405.9Z'
          fill='black'
          fillOpacity='0.5'
        />
      </g>
      <defs>
        <filter
          id='filter0_d'
          x='-15'
          y='-20'
          width='1325'
          height='720'
          filterUnits='userSpaceOnUse'
          colorInterpolationFilters='sRGB'
        >
          <feFlood floodOpacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
          />
          <feOffset dx='4' dy='4' />
          <feGaussianBlur stdDeviation='12' />
          <feColorMatrix
            type='matrix'
            values='0 0 0 0 0.00392157 0 0 0 0 0.0666667 0 0 0 0 0.14902 0 0 0 0.2 0'
          />
          <feBlend
            mode='normal'
            in2='BackgroundImageFix'
            result='effect1_dropShadow'
          />
          <feBlend
            mode='normal'
            in='SourceGraphic'
            in2='effect1_dropShadow'
            result='shape'
          />
        </filter>
      </defs>
    </svg>
  );
};

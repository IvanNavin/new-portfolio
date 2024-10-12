import { SVGProps } from 'react';

export const LoaderIcon = ({
  width = 54,
  height = 54,
}: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox='0 0 54 54'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clipPath='url(#clip0)'>
        <path
          d='M44.9862 44.8927C54.9215 35.0106 54.9215 18.9885 44.9862 9.10634C35.0509 -0.775781 18.9425 -0.775784 9.00721 9.10634C-0.928124 18.9885 -0.928124 35.0106 9.00721 44.8927C18.9425 54.7748 35.0509 54.7748 44.9862 44.8927Z'
          fill='#1D1E1D'
        />
        <path
          d='M54 24.1864C52.5847 10.5961 41.0365 0 26.9981 0C12.9597 0 1.41531 10.5961 0 24.1864H54Z'
          fill='url(#paint0_linear)'
        />
        <path
          d='M0 29.8101C1.41531 43.4004 12.9635 53.9965 26.9981 53.9965C41.0327 53.9965 52.5847 43.4004 53.9962 29.8101H0Z'
          fill='#E7E7E9'
        />
        <path
          d='M26.998 35.5053C31.7217 35.5053 35.5511 31.6965 35.5511 26.998C35.5511 22.2996 31.7217 18.4907 26.998 18.4907C22.2742 18.4907 18.4449 22.2996 18.4449 26.998C18.4449 31.6965 22.2742 35.5053 26.998 35.5053Z'
          fill='#1D1E1D'
        />
        <path
          d='M26.998 33.6447C30.6887 33.6447 33.6806 30.6688 33.6806 26.9979C33.6806 23.3269 30.6887 20.3511 26.998 20.3511C23.3073 20.3511 20.3154 23.3269 20.3154 26.9979C20.3154 30.6688 23.3073 33.6447 26.998 33.6447Z'
          fill='#F7F7F7'
        />
        <path
          d='M26.998 31.4834C29.4887 31.4834 31.5079 29.4751 31.5079 26.9977C31.5079 24.5203 29.4887 22.512 26.998 22.512C24.5072 22.512 22.4881 24.5203 22.4881 26.9977C22.4881 29.4751 24.5072 31.4834 26.998 31.4834Z'
          fill='#B8B5B5'
        />
        <path
          d='M26.9979 31.1527C29.3048 31.1527 31.175 29.2926 31.175 26.998C31.175 24.7034 29.3048 22.8433 26.9979 22.8433C24.691 22.8433 22.8208 24.7034 22.8208 26.998C22.8208 29.2926 24.691 31.1527 26.9979 31.1527Z'
          fill='#F7F7F7'
        />
      </g>
      <defs>
        <linearGradient
          id='paint0_linear'
          x1='58.5803'
          y1='20.2452'
          x2='9.90591'
          y2='21.2724'
          gradientUnits='userSpaceOnUse'
        >
          <stop stop-color='#B57E10' />
          <stop offset='0.240861' stop-color='#B57E10' />
          <stop offset='0.404291' stop-color='#F9DF7B' />
          <stop offset='0.59375' stop-color='#FFF3A6' />
          <stop offset='0.78125' stop-color='#F9DF7B' />
          <stop offset='1' stop-color='#B57E10' />
        </linearGradient>
        <clipPath id='clip0'>
          <rect width='54' height='54' fill='white' />
        </clipPath>
      </defs>
    </svg>
  );
};

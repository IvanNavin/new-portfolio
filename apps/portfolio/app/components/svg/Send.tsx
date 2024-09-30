import { CSSProperties, SVGProps } from 'react';

export const Send = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      version='1.1'
      xmlns='http://www.w3.org/2000/svg'
      x='0px'
      y='0px'
      viewBox='0 0 448 448'
      style={{ enableBackground: 'new 0 0 448 448' } as CSSProperties}
      {...props}
    >
      <g>
        <g>
          <polygon
            points='0.213,32 0,181.333 320,224 0,266.667 0.213,416 448,224'
            fill='white'
          />
        </g>
      </g>
    </svg>
  );
};

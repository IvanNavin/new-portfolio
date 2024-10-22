import { clsxm } from '@repo/utils';
import { createElement, ReactNode } from 'react';

import s from './Header.module.scss';

type Props = {
  children: ReactNode;
  size?: 'xl' | 'l' | 'm' | 's' | 'xs';
  white?: boolean;
};

export const Header = ({ children, size = 'xl', white }: Props) => {
  let sizePoint;
  switch (size) {
    case 'xl':
      sizePoint = 1;
      break;
    case 'l':
      sizePoint = 2;
      break;
    case 'm':
      sizePoint = 3;
      break;
    case 's':
      sizePoint = 4;
      break;
    case 'xs':
      sizePoint = 5;
      break;
    default:
      sizePoint = 1;
  }

  return createElement(
    `h${sizePoint}`,
    {
      className: clsxm(s.header, s[`size${size.toUpperCase()}`], {
        [s.whiteColor]: white,
      }),
    },
    children,
  );
};

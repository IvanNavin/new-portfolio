import { clsxm } from '@repo/utils';
import { ReactNode } from 'react';

import s from './Section.module.scss';

type Props = {
  children: ReactNode;
  bgColor?: string;
  className?: string;
};

export const Section = ({ children, bgColor = '#FFF', className }: Props) => {
  return (
    <section
      className={clsxm(s.root, className)}
      style={{ backgroundColor: bgColor }}
    >
      <div className={s.wrap}>{children}</div>
    </section>
  );
};

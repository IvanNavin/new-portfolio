import { clsxm } from '@repo/utils';
import { ReactNode } from 'react';

import s from './Paragraph.module.scss';

type Props = {
  children: ReactNode;
  white?: boolean;
  small?: boolean;
  lead?: boolean;
};

export const Paragraph = ({
  children,
  white = false,
  small = false,
  lead = false,
}: Props) => {
  return (
    <p
      className={clsxm(
        s.paragraph,
        white && s.white,
        small && s.small,
        lead && s.lead,
      )}
    >
      {children}
    </p>
  );
};

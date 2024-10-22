import { ReactNode } from 'react';

import s from './Button.module.scss';

export const Button = ({ children }: { children: ReactNode }) => {
  return <button className={s.root}>{children}</button>;
};

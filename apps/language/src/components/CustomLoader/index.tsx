import { clsxm } from '@repo/utils';

import s from './styles.module.scss';

type Props = {
  className?: string;
};

export const CustomLoader = ({ className }: Props) => {
  return <div className={clsxm(s.loader, className)}></div>;
};

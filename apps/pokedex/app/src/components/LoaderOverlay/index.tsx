import { LoaderIcon } from '@components/svg';

import s from './styles.module.scss';

export const LoaderOverlay = () => {
  return (
    <div className={s.wrapper}>
      <LoaderIcon className={s.loader} />
    </div>
  );
};

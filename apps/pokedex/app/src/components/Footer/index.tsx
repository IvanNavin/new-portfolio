import { memo } from 'react';

import s from './Footer.module.scss';

const Footer = () => {
  return (
    <div className={s.footer}>
      <span>
        Make with{' '}
        <span role='img' aria-label='img'>
          ❤️
        </span>
      </span>
      <span>Our team</span>
    </div>
  );
};

export default memo(Footer);

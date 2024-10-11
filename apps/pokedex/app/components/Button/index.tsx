import { MouseEvent, ReactNode } from 'react';

import cn from 'classnames';
import s from './Button.module.scss';

interface ButtonProps {
  size?: 'big' | 'small';
  color?: 'green' | 'yellow';
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  isWide?: boolean;
  children: ReactNode;
}

const Button = ({
  isWide = false,
  size = 'big',
  color = 'green',
  children,
  onClick,
}: ButtonProps) => {
  const btnClass = cn(s.root, s[size], s[color], { [s.wide]: isWide });

  return (
    <button type='button' className={btnClass} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;

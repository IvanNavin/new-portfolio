import { ChangeEvent } from 'react';

import s from './Input.module.scss';

type Props = {
  inputValue: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const Input = ({ ...props }: Props) => {
  const { inputValue, onChange } = props;
  return (
    <input
      type='text'
      className={s.root}
      value={inputValue}
      onChange={onChange}
      placeholder='Find your pokemon...'
    />
  );
};

export default Input;

import { clsxm } from '@repo/utils';
import { Loader } from '@src/components/Loader';
import { ChangeEvent } from 'react';

import s from './input.module.scss';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  buttonLabel: string;
  loading: boolean;
  error?: string;
  onSearch: (value: string) => void;
};

export const Input = ({
  value,
  onChange,
  placeholder,
  buttonLabel,
  loading,
  error,
  onSearch,
}: Props) => {
  return (
    <div className={s.wrapper}>
      <input
        value={value}
        onChange={({ target: { value: val } }: ChangeEvent<HTMLInputElement>) =>
          onChange(val)
        }
        className={clsxm(s.input, error && s.error)}
        placeholder={placeholder}
        onKeyDown={({ key }) => key === 'Enter' && onSearch(value)}
      />
      <button className={s.button} onClick={() => onSearch(value)}>
        {loading && <Loader />}
        {buttonLabel}
      </button>
    </div>
  );
};

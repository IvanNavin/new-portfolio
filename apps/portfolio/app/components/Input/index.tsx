import { clsxm } from '@repo/utils';
import { InputHTMLAttributes, ReactNode, useState } from 'react';

type Props = {
  label?: string | JSX.Element;
  error?: ReactNode;
  className?: string;
  inputClassNames?: string;
  errorClassNames?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export const Input = ({
  label,
  value,
  onChange,
  error,
  className,
  inputClassNames,
  errorClassNames,
}: Props) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={clsxm('relative', className)}>
      <input
        value={value}
        onChange={onChange}
        className={clsxm(
          'bg-transparent border border-white/50 text-white p-4 h-12',
          'text-[14px] leading-none w-full',
          inputClassNames,
        )}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <label
        className={clsxm(
          'absolute text-[14px] top-4 left-4 leading-none',
          'origin-top-left transition-all ease-in-out duration-200',
          (focused || (value as string)?.length) &&
            'scale-50 top-[7px] opacity-50',
        )}
      >
        {label}
      </label>
      {error && (
        <span className={clsxm('text-red-600 mt-1', errorClassNames)}>
          {error}
        </span>
      )}
    </div>
  );
};

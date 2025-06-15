import { clsxm } from '@repo/utils';
import { useMemo } from 'react';

import { Filters } from './types';

type Props = {
  filters: Filters;
  onRemove: (value: string) => void;
};

export const FilterChips = ({ filters, onRemove }: Props) => {
  const values = useMemo(
    () => [...filters.workType, ...filters.stack],
    [filters],
  );

  return (
    <div className='my-4 flex min-h-6 flex-wrap gap-2'>
      {values.map((value) => (
        <span
          className='relative inline-flex gap-1 rounded-full bg-[#ddd] py-0 pl-3 pr-5 text-black'
          key={value}
        >
          <span className='capitalize'>{value}</span>
          <span
            className={clsxm(
              'inline-flex cursor-pointer select-none items-center justify-center text-[12px]',
              'absolute top-1/2 right-2 -translate-y-1/2',
              'hover:text-red-600 transition-all duration-300 ease-linear',
            )}
            onClick={() => onRemove(value)}
          >
            x
          </span>
        </span>
      ))}
    </div>
  );
};

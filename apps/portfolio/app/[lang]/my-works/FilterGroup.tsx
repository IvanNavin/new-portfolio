import { Option } from '@app/[lang]/my-works/types';
import { Checkbox } from '@mantine/core';

type Props = {
  title: string;
  options: Option[];
  selected: string[];
  onChange: (value: string) => void;
};

export const FilterGroup = ({ title, options, selected, onChange }: Props) => {
  return (
    <div className='space-y-2'>
      <h3 className='font-bold text-white'>{title}</h3>
      <div className='flex flex-col gap-1'>
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={selected.includes(option.value)}
            onChange={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
};

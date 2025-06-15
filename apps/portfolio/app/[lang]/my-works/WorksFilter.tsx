'use client';
import { workTypeOptions } from '@app/[lang]/my-works/constants';
import { useMemo } from 'react';

import { FilterGroup } from './FilterGroup';
import { EWorkType, Filters } from './types';

type Props = {
  filters: Filters;
  allStacks: string[];
  onChange: (filters: Filters) => void;
};

export const WorksFilter = ({ filters, allStacks, onChange }: Props) => {
  const technologyOptions = useMemo(
    () =>
      allStacks
        .map((s) => ({ label: s, value: s }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [allStacks],
  );

  const handleChange = (key: keyof Filters, value: string) => {
    if (key === 'workType') {
      const casted = value as EWorkType;
      const current = filters.workType;
      const next = current.includes(casted)
        ? current.filter((v) => v !== casted)
        : [...current, casted];

      onChange({ ...filters, workType: next });
    } else if (key === 'stack') {
      const current = filters.stack;
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];

      onChange({ ...filters, stack: next });
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <FilterGroup
        title='Work Type'
        options={workTypeOptions}
        selected={filters.workType}
        onChange={(v) => handleChange('workType', v)}
      />
      <FilterGroup
        title='Technologies'
        options={technologyOptions}
        selected={filters.stack}
        onChange={(v) => handleChange('stack', v)}
      />
    </div>
  );
};

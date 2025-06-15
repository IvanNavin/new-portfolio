'use client';
import { DefaultProps } from '@app/types';
import { Container } from '@components/Container';
import { useTranslation } from '@i18n/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { getWorks } from './constants';
import { FilterChips } from './FilterChips';
import { EWorkType, Filters } from './types';
import { WorkItem } from './WorkItem';
import { WorksFilter } from './WorksFilter';

const parseMultiParam = (param: string | null) =>
  param?.split(',').filter(Boolean) ?? [];

export default function Page({ params: { lang } }: DefaultProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    workType: parseMultiParam(searchParams.get('type')) as EWorkType[],
    stack: parseMultiParam(searchParams.get('stack')),
  });

  const allWorks = useMemo(() => getWorks(lang), [lang]);

  const allStacks = useMemo(() => {
    const sets = new Set<string>();

    allWorks.forEach((w) => w.stack.forEach((s) => sets.add(s)));

    return Array.from(sets).sort();
  }, [allWorks]);

  const filteredWorks = useMemo(() => {
    return allWorks.filter((work) => {
      const typeMatch =
        !filters.workType.length ||
        work.workType?.some((type) => filters.workType.includes(type));

      const stackMatch =
        !filters.stack.length ||
        filters.stack.every((s) => work.stack.includes(s));

      return typeMatch && stackMatch;
    });
  }, [allWorks, filters]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.workType.length) {
      params.set('type', filters.workType.join(','));
    }
    if (filters.stack.length) {
      params.set('stack', filters.stack.join(','));
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters]);

  return (
    <Container
      lang={lang}
      backText={t('ivan')}
      title={t('myWorks.myWorks')}
      className='max-w-[1200px]'
    >
      <p>{t('myWorks.description')}</p>

      <FilterChips
        filters={filters}
        onRemove={(value) => {
          setFilters((prev) => ({
            workType: prev.workType.filter((v) => v !== value),
            stack: prev.stack.filter((v) => v !== value),
          }));
        }}
      />

      <div className='flex flex-row gap-8'>
        <div
          className='sticky top-0 max-h-screen w-[220px] overflow-y-auto pb-6'
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE 10+
          }}
        >
          <WorksFilter
            filters={filters}
            allStacks={allStacks}
            onChange={setFilters}
          />
        </div>

        <nav className='relative mx-auto flex max-w-[1200] flex-1 flex-wrap justify-around transition-all duration-300 ease-out'>
          {filteredWorks.map((item) => (
            <WorkItem item={item} key={item.id} />
          ))}
        </nav>
      </div>
    </Container>
  );
}

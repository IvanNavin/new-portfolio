import { useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { DEBOUNCE_TIME } from '@src/components/VisitStatTable/constants';

export const useVisitStatState = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([
    { id: 'timestamp', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<
    { id: string; value: unknown }[]
  >([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const [debouncedGlobalFilter] = useDebouncedValue(
    globalFilter,
    DEBOUNCE_TIME,
  );
  const [debouncedColumnFilters] = useDebouncedValue(
    columnFilters,
    DEBOUNCE_TIME,
  );
  const [debouncedDateRange] = useDebouncedValue(dateRange, DEBOUNCE_TIME);

  return {
    pagination,
    setPagination,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    dateRange,
    setDateRange,

    debouncedGlobalFilter,
    debouncedColumnFilters,
    debouncedDateRange,
  };
};

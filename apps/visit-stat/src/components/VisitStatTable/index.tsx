'use client';
import { useEffect } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import type { VisitStat } from './types';
import { ALLOWED_SERVER_SORT } from './constants';
import { useVisitStatState } from './hooks/useVisitStatState';
import { useVisitStatColumns } from './hooks/useVisitStatColumns';
import { useVisitStatQuery } from './hooks/useVisitStatQuery';
import { useVisitStatData } from './hooks/useVisitStatData';
import { Toolbar } from './components/Toolbar';
import { useCountriesOptions } from '@src/components/VisitStatTable/hooks/useCountries';

export const VisitStatTable = () => {
  const {
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
    debouncedColumnFilters,
    debouncedGlobalFilter,
    debouncedDateRange,
  } = useVisitStatState();

  const columns = useVisitStatColumns();

  const { buildQuery } = useVisitStatQuery({
    pagination,
    sorting,
    columnFilters: debouncedColumnFilters,
    globalFilter: debouncedGlobalFilter,
    dateRange: debouncedDateRange,
  });

  const { data, rowCount, isLoading, isRefetching, fetchData } =
    useVisitStatData(buildQuery);

  const countryOpts = useCountriesOptions();

  const table = useMantineReactTable<VisitStat>({
    columns,
    data,
    getRowId: (row) => row.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableGlobalFilter: true,
    rowCount,
    enableRowSelection: true,
    enableColumnResizing: true,
    enableStickyHeader: true,
    initialState: {
      density: 'xs',
      showGlobalFilter: true,
      pagination: { pageIndex: 0, pageSize: 20 },
      sorting: [{ id: 'timestamp', desc: true }],
      columnPinning: { left: ['mrt-row-select'] },
    },
    onPaginationChange: setPagination,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      if (next?.[0]?.id && !ALLOWED_SERVER_SORT.has(next[0].id)) {
        setSorting([{ id: 'timestamp', desc: true }]);
      } else {
        setSorting(next);
      }
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
      isLoading,
      showAlertBanner: false,
      showProgressBars: isRefetching,
    },
    positionGlobalFilter: 'left',
    mantinePaperProps: { p: 'md' },
    renderTopToolbar: () => (
      <Toolbar
        table={table}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        sorting={sorting}
        setSorting={setSorting}
        pagination={pagination}
        setPagination={setPagination}
        fetchData={fetchData}
        countryOptions={countryOpts}
      />
    ),
  });

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    debouncedColumnFilters,
    debouncedGlobalFilter,
    debouncedDateRange,
  ]);

  return <MantineReactTable table={table} />;
};

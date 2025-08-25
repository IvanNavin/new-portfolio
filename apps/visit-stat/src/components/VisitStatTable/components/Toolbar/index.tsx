import { Button, Group, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { MRT_TableInstance } from 'mantine-react-table';
import type { VisitStat } from '../../types';
import { EVENT_OPTIONS } from '@src/components/VisitStatTable/constants';

type Props = {
  table: MRT_TableInstance<VisitStat>;
  columnFilters: { id: string; value: unknown }[];
  setColumnFilters: (v: { id: string; value: unknown }[]) => void;
  globalFilter: string;
  setGlobalFilter: (v: string) => void;
  dateRange: [Date | null, Date | null];
  setDateRange: (v: [Date | null, Date | null]) => void;
  sorting: { id: string; desc: boolean }[];
  setSorting: (v: { id: string; desc: boolean }[]) => void;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: (v: { pageIndex: number; pageSize: number }) => void;
  fetchData: () => Promise<void>;
  countryOptions: { value: string; label: string }[];
};

export const Toolbar = ({
  table,
  columnFilters,
  setColumnFilters,
  globalFilter,
  setGlobalFilter,
  dateRange,
  setDateRange,
  sorting: _sorting,
  setSorting,
  pagination,
  setPagination,
  fetchData,
  countryOptions,
}: Props) => {
  const domainFilter = columnFilters.find((f) => f.id === 'domain')?.value as
    | string
    | undefined;
  const pathFilter = columnFilters.find((f) => f.id === 'path')?.value as
    | string
    | undefined;
  const eventFilter = columnFilters.find((f) => f.id === 'event')?.value as
    | string
    | undefined;
  const countryFilter = columnFilters.find((f) => f.id === 'country')?.value as
    | string
    | undefined;
  const deviceFilter = columnFilters.find((f) => f.id === 'deviceType')
    ?.value as string | undefined;

  const setColFilter = (id: string, value: string | null) => {
    const next = [...columnFilters];
    const idx = next.findIndex((f) => f.id === id);
    if (value && value.trim()) {
      if (idx >= 0) next[idx] = { id, value: value.trim() };
      else next.push({ id, value: value.trim() });
    } else if (idx >= 0) {
      next.splice(idx, 1);
    }
    setColumnFilters(next);
  };

  const handleBulkDelete = async () => {
    const ids = table.getSelectedRowModel().flatRows.map((r) => r.original.id);
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} rows?`)) return;
    const res = await fetch('/api', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) return;
    table.resetRowSelection();
    await fetchData();
  };
  const selectedCount = table.getSelectedRowModel().flatRows.length;
  console.log('### selectedCount: ', selectedCount);

  return (
    <Group p='xs' gap='xs' wrap='wrap' align='center'>
      <TextInput
        placeholder='Search all (q)'
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.currentTarget.value)}
        style={{ width: 260 }}
      />
      <TextInput
        placeholder='domain'
        value={domainFilter ?? ''}
        onChange={(e) => setColFilter('domain', e.currentTarget.value)}
        style={{ width: 200 }}
      />
      <TextInput
        placeholder='path'
        value={pathFilter ?? ''}
        onChange={(e) => setColFilter('path', e.currentTarget.value)}
        style={{ width: 220 }}
      />
      <Select
        name='x-event'
        placeholder='event'
        data={EVENT_OPTIONS}
        clearable
        value={eventFilter ?? null}
        onChange={(v) => setColFilter('event', v)}
        autoComplete='off'
        style={{ width: 160 }}
      />
      <Select
        name='x-country'
        placeholder='country'
        data={countryOptions}
        clearable
        value={countryFilter ?? null}
        onChange={(v) => setColFilter('country', v)}
        autoComplete='off'
        style={{ width: 200 }}
      />
      <Select
        placeholder='device'
        data={[
          { value: 'desktop', label: 'desktop' },
          { value: 'mobile', label: 'mobile' },
          { value: 'tablet', label: 'tablet' },
        ]}
        value={deviceFilter ?? null}
        onChange={(v) => setColFilter('deviceType', v)}
        clearable
        style={{ width: 140 }}
      />
      <DatePickerInput
        type='range'
        placeholder='from — to'
        value={dateRange}
        onChange={(v) => setDateRange(v as [Date | null, Date | null])}
        allowSingleDateInRange
      />
      <Button
        color='red'
        variant='filled'
        onClick={handleBulkDelete}
        disabled={selectedCount === 0}
      >
        Delete selected ({selectedCount})
      </Button>
      <Button
        variant='light'
        onClick={() => {
          setGlobalFilter('');
          setColumnFilters([]);
          setDateRange([null, null]);
          setSorting([{ id: 'timestamp', desc: true }]);
          setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
        }}
      >
        Reset
      </Button>
      <Button variant='filled' onClick={fetchData}>
        Refresh
      </Button>
    </Group>
  );
};

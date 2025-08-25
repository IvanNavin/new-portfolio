import dayjs from 'dayjs';

type ColumnFilter = { id: string; value: unknown };
type Pagination = { pageIndex: number; pageSize: number };
type Sorting = { id: string; desc: boolean }[];

const toIso = (d: unknown, endOfDay = false): string | null => {
  if (!d) return null;
  const date =
    d instanceof Date
      ? d
      : typeof d === 'string' || typeof d === 'number'
        ? new Date(d)
        : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return (endOfDay ? dayjs(date).endOf('day').toDate() : date).toISOString();
};

export const useVisitStatQuery = (args: {
  pagination: Pagination;
  sorting: Sorting;
  columnFilters: ColumnFilter[];
  globalFilter: string;
  dateRange: [Date | null, Date | null];
}) => {
  const { pagination, sorting, columnFilters, globalFilter, dateRange } = args;

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set('page', String(pagination.pageIndex + 1));
    params.set('pageSize', String(pagination.pageSize));

    if (sorting.length) {
      const s = sorting[0];
      params.set('sortBy', s.id);
      params.set('sortOrder', s.desc ? 'desc' : 'asc');
    }

    for (const f of columnFilters) {
      if (!f?.id) continue;
      const val = String(f.value ?? '');
      if (!val) continue;
      if (['domain', 'path', 'event', 'country', 'deviceType'].includes(f.id)) {
        params.set(f.id, val);
      }
    }

    if (globalFilter.trim()) params.set('q', globalFilter.trim());

    const [from, to] = dateRange;
    const fromIso = toIso(from);
    const toIsoStr = toIso(to, true);
    if (fromIso) params.set('from', fromIso);
    if (toIsoStr) params.set('to', toIsoStr);

    return params.toString();
  };

  return { buildQuery };
};

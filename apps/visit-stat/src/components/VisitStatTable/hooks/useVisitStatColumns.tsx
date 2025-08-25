import dayjs from 'dayjs';
import { Tooltip } from '@mantine/core';
import type { MRT_ColumnDef } from 'mantine-react-table';
import type { VisitStat } from '../types';
import { countryName, tzWithOffset, truncate } from '../utils';
import { useMemo } from 'react';

export const useVisitStatColumns = (): MRT_ColumnDef<VisitStat>[] =>
  useMemo(
    () => [
      {
        id: 'timestamp',
        header: 'Time',
        accessorKey: 'timestamp',
        enableSorting: true,
        Cell: ({ cell }) =>
          dayjs(String(cell.getValue() ?? '')).format('DD MMM YYYY - HH:mm:ss'),
      },
      {
        id: 'domain',
        header: 'Domain',
        accessorKey: 'domain',
        enableSorting: true,
      },
      {
        id: 'path',
        header: 'Path',
        accessorKey: 'path',
        enableSorting: true,
        Cell: ({ cell }) => {
          const v = String(cell.getValue() ?? '');
          if (!v) return null;
          return (
            <Tooltip withArrow label={v}>
              <span>{truncate(v, 60)}</span>
            </Tooltip>
          );
        },
      },
      {
        id: 'coords',
        header: 'Lat/Lng',
        enableSorting: false,
        Cell: ({ row }) => {
          const { latitude: lat, longitude: lng } = row.original;
          if (lat == null || lng == null) return null;
          const href = `https://www.google.com/maps?q=${lat},${lng}`;
          return (
            <a
              href={href}
              target='_blank'
              rel='noreferrer'
              className='text-blue-500 hover:underline'
            >
              {lat.toFixed(5)} / {lng.toFixed(5)}
            </a>
          );
        },
      },
      {
        id: 'country',
        header: 'Country',
        accessorKey: 'country',
        enableSorting: true,
        Cell: ({ cell }) => countryName(String(cell.getValue() ?? '')),
      },
      { id: 'city', header: 'City', accessorKey: 'city', enableSorting: true },
      {
        id: 'region',
        header: 'Region',
        accessorKey: 'region',
        enableSorting: false,
      },
      {
        id: 'timeZone',
        header: 'Time zone',
        accessorKey: 'timeZone',
        enableSorting: false,
        Cell: ({ cell }) => tzWithOffset(String(cell.getValue() ?? '')),
      },
      {
        id: 'language',
        header: 'Lang',
        accessorKey: 'language',
        enableSorting: false,
      },
      {
        id: 'deviceType',
        header: 'Device',
        accessorKey: 'deviceType',
        enableSorting: false,
      },
      {
        id: 'userAgent',
        header: 'User Agent',
        accessorKey: 'userAgent',
        enableSorting: false,
        Cell: ({ cell }) => {
          const ua = String(cell.getValue() ?? '');
          return (
            <Tooltip withArrow label={ua}>
              <span>{truncate(ua, 140)}</span>
            </Tooltip>
          );
        },
      },
      {
        id: 'event',
        header: 'Event',
        accessorKey: 'event',
        enableSorting: true,
      },
      {
        id: 'extra',
        header: 'Extra',
        accessorFn: (row) => row.extra,
        enableSorting: false,
        Cell: ({ cell }) => {
          const v = cell.getValue();
          let full;
          try {
            full =
              typeof v === 'string'
                ? v
                : v == null
                  ? 'null'
                  : JSON.stringify(v, null, 2);
          } catch {
            full = '';
          }
          if (!full) return null;
          return (
            <Tooltip
              withArrow
              multiline
              label={
                <div style={{ maxWidth: 600, whiteSpace: 'pre-wrap' }}>
                  <pre style={{ margin: 0 }}>{full}</pre>
                </div>
              }
            >
              <span>{truncate(full, 160)}</span>
            </Tooltip>
          );
        },
      },
      { id: 'ip', header: 'IP', accessorKey: 'ip', enableSorting: false },
    ],
    [],
  );

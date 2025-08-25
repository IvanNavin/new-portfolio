import { useState } from 'react';
import type { VisitStat, ApiListResponse } from '../types';

export const useVisitStatData = (buildQuery: () => string) => {
  const [data, setData] = useState<VisitStat[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null); // опційно

  const fetchData = async () => {
    setIsLoading(!data.length);
    setIsRefetching(!!data.length);
    const qs = buildQuery();

    try {
      const res = await fetch(`/api?${qs}`, { cache: 'no-store' });

      if (!res.ok) {
        setError(String(res.status)); // опційно
        setData([]);
        setRowCount(0);
        return; // ← без throw
      }

      const json: ApiListResponse = await res.json();
      setError(null); // опційно
      setData(json.items);
      setRowCount(json.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'network_error'); // опційно
      setData([]);
      setRowCount(0);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  return {
    data,
    rowCount,
    isLoading,
    isRefetching,
    error,
    fetchData,
    setData,
    setRowCount,
  };
};

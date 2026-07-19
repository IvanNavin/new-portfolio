import { useRef, useState } from 'react';
import type { VisitStat, ApiListResponse } from '../types';

export const useVisitStatData = (buildQuery: () => string) => {
  const [data, setData] = useState<VisitStat[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null); // опційно

  // Monotonic request id: overlapping fetches can resolve out of order; only the
  // latest may write state (else stale rows land over the current query).
  const requestIdRef = useRef(0);

  const fetchData = async () => {
    const requestId = ++requestIdRef.current;
    const isStale = () => requestId !== requestIdRef.current;

    setIsLoading(!data.length);
    setIsRefetching(!!data.length);
    const qs = buildQuery();

    try {
      const res = await fetch(`/api?${qs}`, { cache: 'no-store' });
      if (isStale()) return;

      if (!res.ok) {
        setError(String(res.status));
        setData([]);
        setRowCount(0);
        return;
      }

      const json: ApiListResponse = await res.json();
      if (isStale()) return;

      setError(null);
      setData(json.items);
      setRowCount(json.total);
    } catch (e) {
      if (isStale()) return;
      setError(e instanceof Error ? e.message : 'network_error'); // опційно
      setData([]);
      setRowCount(0);
    } finally {
      // Only the latest request clears the loading flags.
      if (!isStale()) {
        setIsLoading(false);
        setIsRefetching(false);
      }
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

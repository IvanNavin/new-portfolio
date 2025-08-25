import { useEffect, useState } from 'react';
import { countryName } from '../utils';

export type CountryOption = { value: string; label: string };

export const useCountriesOptions = () => {
  const [options, setOptions] = useState<CountryOption[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/facets/countries', { signal: ac.signal });
        if (!res.ok) return;
        const json: { items: { code: string; count: number }[] } =
          await res.json();
        const opts = json.items
          .map((i) => i.code.toUpperCase())
          .filter((v, i, a) => a.indexOf(v) === i)
          .sort()
          .map((code) => ({ value: code, label: countryName(code) }));
        setOptions(opts);
      } catch {}
    })();
    return () => ac.abort();
  }, []);

  return options;
};

'use client';
import Input from '@components/Input';
import { useDebouncedValue } from '@mantine/hooks';
import { LinkEnum } from '@src/constants';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';

export const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState(searchParam);
  const [debouncedValue] = useDebouncedValue(inputValue, 500);

  // Keep the input in sync when the URL changes from the outside
  // (browser back/forward, a shared link).
  useEffect(() => {
    setInputValue(searchParam);
  }, [searchParam]);

  // Only touch the URL once typing has settled — this debounces the
  // RSC navigation, not just the API call.
  useEffect(() => {
    if (debouncedValue === searchParam) return;

    router.replace(
      debouncedValue
        ? `${LinkEnum.POKEDEX}?search=${encodeURIComponent(debouncedValue)}`
        : LinkEnum.POKEDEX,
    );
  }, [debouncedValue]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return <Input inputValue={inputValue} onChange={onChange} />;
};

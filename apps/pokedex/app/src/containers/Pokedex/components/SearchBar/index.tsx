'use client';
import Input from '@components/Input';
import { LinkEnum } from '@src/constants';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';

export const SearchBar = () => {
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search') || '';

  useEffect(() => {
    setInputValue(searchParam);
  }, [searchParam]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (!e.target.value) {
      router.replace(LinkEnum.POKEDEX);
    } else {
      router.replace(`${LinkEnum.POKEDEX}?search=${e.target.value}`);
    }
  };

  return <Input inputValue={inputValue} onChange={onChange} />;
};

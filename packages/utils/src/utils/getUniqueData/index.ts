'use client';
import { AnyType } from 'portfolio/app/types';

export const getUniqueData = (data: AnyType): AnyType => {
  const stringifyData = data
    .filter(Boolean)
    .map((item: AnyType) => JSON.stringify(item));
  const uniqueData = new Set(stringifyData);

  return Array.from(uniqueData).map((item) => JSON.parse(item as AnyType));
};

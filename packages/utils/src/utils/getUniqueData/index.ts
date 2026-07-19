'use client';
import { AnyType } from '../../types';

// Order-independent stringify so {a:1,b:2} and {b:2,a:1} dedupe to one.
const stableStringify = (value: AnyType): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
    .join(',')}}`;
};

// Distinct items, first-seen order. Unlike filter(Boolean) this keeps legit
// falsy values (0, '', false, null) and dedupes objects regardless of key order.
export const getUniqueData = (data: AnyType): AnyType => {
  const seen = new Set<string | undefined>();
  const result: AnyType[] = [];

  for (const item of data) {
    const key = stableStringify(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
};

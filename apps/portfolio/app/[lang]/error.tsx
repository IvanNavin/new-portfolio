'use client';

import { AnyType } from '@app/types';

export default function Error(props: AnyType) {
  return <div>{JSON.stringify(props)}</div>;
}

'use client';
import { ROUTES } from '@app/constants/routes';
import { AnyType } from '@app/types';
import { useRouter } from 'next/navigation';

export default function NotFound(props: AnyType) {
  const { push } = useRouter();

  return (
    <div className='flex h-screen w-screen items-center justify-center gap-6'>
      <span>Page not Found</span>
      {JSON.stringify(props, null, 2)}
      <button
        className='rounded border border-white bg-transparent px-4 py-3'
        onClick={() => push(ROUTES.root())}
      >
        Home
      </button>
    </div>
  );
}

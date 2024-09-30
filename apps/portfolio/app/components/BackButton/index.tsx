import { clsxm } from '@repo/utils';
import React from 'react';

import { BackButtonProps } from './types';
import { useBackButton } from './useBackButton';

export default function BackButton({
  className,
  text,
  onClick,
}: BackButtonProps) {
  const { ref, hovered, canvasReady } = useBackButton();

  return (
    <button
      className='fixed right-1 top-1 z-[9999] overflow-hidden rounded-full'
      onClick={onClick}
    >
      <canvas
        ref={ref}
        className={clsxm(hovered && 'cursor-pointer', className)}
      />
      {canvasReady && (
        <span className='pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[16px] text-white'>
          {text}
        </span>
      )}
    </button>
  );
}

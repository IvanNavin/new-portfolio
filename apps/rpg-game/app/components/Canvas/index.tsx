import { useGlobalContext } from '@app/hooks/useGlobalContext';

export const Canvas = () => {
  const { opts } = useGlobalContext();
  const { world = [] } = opts || {};

  return (
    <canvas
      id='world'
      width='600'
      height='600'
      tabIndex={1}
      className='absolute inset-2 z-[1]'
    >
      Your browser does not support Canvas
    </canvas>
  );
};

import { useGlobalContext } from '@app/hooks/useGlobalContext';
import { clsxm, noop } from '@repo/utils';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '');

export const StartScreen = () => {
  const { name = '', setName = noop, setInGame = noop } = useGlobalContext();

  const onClick = () => {
    if (name?.length > 12) return;
    socket.emit('start', name);
    setInGame(true);
  };

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center rounded-[20px] bg-[url('/assets/WorldMap.png')] bg-center text-gray-200">
      <form id='nameForm' className='text-center'>
        <label className='mb-3 block text-5xl text-shadow-lg'>
          Put Your Name
        </label>
        <div className='mb-3'>
          <input
            className='h-[46px] w-[200px] rounded border-4 border-gray-500 px-3 text-center text-2xl text-black'
            type='text'
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            autoFocus
          />
        </div>
        <div>
          <button
            className={clsxm(
              'relative h-[56px] w-[200px] cursor-pointer border-none',
              'bg-[url("/assets/button.png")] indent-[-9999px] outline-0',
              'before:size-8 before:absolute before:top-[60%] before:-left-[30%]',
              'before:bg-[url("/assets/small-pointer.png")] before:-translate-y-1/2',
              'before:transition-all before:duration-100 before:ease-linear',
              'hover:before:top-[59%] hover:before:left-[-38px]',
            )}
            onClick={onClick}
            disabled={name.length > 12 || name.length === 0}
          >
            START GAME
          </button>
        </div>

        {name.length > 12 && (
          <p className='mt-4 rounded-[10px] bg-white/60 p-1 text-[20px] font-bold text-black text-shadow'>
            My friend, who do you think you are??? <br />
            come up with a shorter name.
          </p>
        )}
      </form>
    </div>
  );
};

'use client';
import { GlobalContext } from '@app/context/globalContext';
import { OptsType } from '@app/types';
import { useState } from 'react';

import { Borders } from '../Borders';
import { Canvas } from '../Canvas';
import { StartScreen } from '../StartScreen';

export type Props = {
  opts: OptsType;
};

export const Layout = ({ opts: initialOpts }: Props) => {
  const [opts, setOpts] = useState<OptsType | null>(initialOpts);
  // const [loading, setLoading] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [name, setName] = useState('');
  const value = { opts, setOpts, inGame, setInGame, name, setName };

  return (
    <GlobalContext.Provider value={value}>
      <div className='relative flex min-h-screen flex-col items-center justify-center bg-black bg-[url("/assets/Mountains1.png")] bg-cover'>
        <div className='relative flex size-[616px] items-center justify-center rounded-[12px] bg-gray-400 p-2 text-[38px]'>
          <Borders />
          {/*{loading && <h3>Loading...</h3>}*/}
          {inGame ? <Canvas /> : <StartScreen />}
        </div>
      </div>
    </GlobalContext.Provider>
  );
};

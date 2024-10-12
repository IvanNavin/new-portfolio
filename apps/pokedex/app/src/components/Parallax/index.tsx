import Image from 'next/image';
import { useEffect, useState } from 'react';

import s from './Parallax.module.scss';

import CloudPng from './assets/Cloud1.png';
import CloudBigPng from './assets/Cloud2.png';
import PikachuPng from './assets/Pikachu.png';
import SmallPokeBallPng from './assets/PokeBall1.png';
import PokeBallPng from './assets/PokeBall2.png';

export const ParallaxEffect = () => {
  const [screenX, setScreenX] = useState(0);
  const [screenY, setScreenY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setScreenX(event.screenX);
      setScreenY(event.screenY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [screenX, screenY]);

  return { screenX, screenY };
};

const Parallax = () => {
  const { screenX, screenY } = ParallaxEffect();

  return (
    <div className={s.root}>
      <div
        className={s.smallPokeBall}
        style={{
          transform: `translate(${screenY * 0.03}px, ${screenX * 0.05}px)`,
        }}
      >
        <Image src={SmallPokeBallPng} alt='Small PokeBall' />
      </div>
      <div
        className={s.cloud}
        style={{
          transform: `translate(${screenY * -0.04}px, ${screenX * -0.04}px)`,
        }}
      >
        <Image src={CloudPng} alt='Cloud PokeBall' />
      </div>
      <div
        className={s.cloudBig}
        style={{
          transform: `translate(${screenY * 0.03}px, ${screenX * 0.03}px)`,
        }}
      >
        <Image src={CloudBigPng} alt='Cloud Big PokeBall' />
      </div>

      <div
        className={s.pokeBall}
        style={{
          transform: `translate(${screenY * 0.02}px, ${screenX * 0.02}px)`,
        }}
      >
        <Image src={PokeBallPng} alt='Big PokeBall' />
      </div>
      <div
        className={s.pikachu}
        style={{
          transform: `translate(${screenY * -0.01}px, ${screenX * -0.01}px)`,
        }}
      >
        <Image src={PikachuPng} alt='Cloud PokeBall' />
      </div>
    </div>
  );
};

export default Parallax;

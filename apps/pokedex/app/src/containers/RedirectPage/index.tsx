'use client';
import React from 'react';
import Button from '../../components/Button';
import { ParallaxEffect } from '@app/src/components/Parallax';
import { LinkEnum } from '@src/constants/routes';
import Image from 'next/image';
import Trio from './assets/Team_Rocket_trio.png';

import s from './404.module.scss';
import { NotFound } from '@app/src/components/svg';
import { useRouter } from 'next/navigation';

const RedirectPage = () => {
  const { screenX, screenY } = ParallaxEffect();
  const router = useRouter();

  return (
    <div className={s.root}>
      <div className={s.titleblock}>
        <NotFound className={s.title} />
        <div className={s.trio}>
          <Image
            priority={true}
            src={Trio}
            alt='Trio'
            style={{
              transform: `translate(${screenY * 0.03}px, ${screenX * 0.05}px)`,
            }}
          />
        </div>
      </div>
      <div className={s.wrapper}>
        <span className={s.left}>The rocket team&nbsp;</span>
        <span className={s.right}>has won this time.</span>
      </div>
      <Button
        size='big'
        color='yellow'
        onClick={() => router.push(LinkEnum.HOME)}
      >
        Return
      </Button>
    </div>
  );
};

export default RedirectPage;

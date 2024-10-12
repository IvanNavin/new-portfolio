'use client';
import Button from '@components/Button';
import Layout from '@components/Layout';
import Parallax from '@components/Parallax';
import { LinkEnum } from '@constants/routes';
import { useRouter } from 'next/navigation';

import s from './Home.module.scss';

export const HomePage = () => {
  const router = useRouter();

  return (
    <div className={s.root}>
      <Layout className={s.contentWrap}>
        <div className={s.contentText}>
          <h1>
            <b>Find</b> all your
            <br /> favourite <b>Pokemon</b>
          </h1>
          <p>
            You can know the type of Pokemon, its strengths, disadvantages and
            abilities
          </p>
          <Button
            size='big'
            color='green'
            onClick={() => router.push(LinkEnum.POKEDEX)}
          >
            See pokemons
          </Button>
        </div>
        <Parallax />
      </Layout>
    </div>
  );
};

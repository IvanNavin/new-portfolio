'use client';
import { FindAllPokemonText } from '@components/FindAllPokemonText';
import Layout from '@components/Layout';
import Parallax from '@components/Parallax';

import s from './Home.module.scss';

export const HomePage = () => {
  return (
    <div className={s.root}>
      <Layout className={s.contentWrap}>
        <FindAllPokemonText />
        <Parallax />
      </Layout>
    </div>
  );
};

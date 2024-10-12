'use client';
import s from './Home.module.scss';
import Layout from '@components/Layout';
import Heading from '@components/Heading';
import Button from '@components/Button';
import { useRouter } from 'next/navigation';
import { LinkEnum } from '@constants/routes';
import Parallax from '@components/Parallax';

export const HomePage = () => {
  const router = useRouter();

  return (
    <div className={s.root}>
      <Layout className={s.contentWrap}>
        <div className={s.contentText}>
          <Heading tag='h1'>
            <b>Find</b> all your
            <br /> favourite <b>Pokemon</b>
          </Heading>
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

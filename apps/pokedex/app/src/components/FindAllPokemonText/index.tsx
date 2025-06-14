import Button from '@components/Button';
import { LinkEnum } from '@src/constants';
import { useRouter } from 'next/navigation';

import s from './styles.module.scss';

export const FindAllPokemonText = () => {
  const router = useRouter();
  return (
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
  );
};

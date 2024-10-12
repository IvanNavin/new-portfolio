'use client';
import { Filters } from '@containers/Pokedex/components/Filters';
import { PokedexResult } from '@containers/Pokedex/components/PokedexResult';
import { SearchBar } from '@containers/Pokedex/components/SearchBar';
import { useState } from 'react';

import s from './styles.module.scss';

import { PokedexContext } from './context';

export const Pokedex = () => {
  const [types, setTypes] = useState<string[]>([]);
  const [experience, setExperience] = useState<[number, number]>([0, 300]);
  const [attack, setAttack] = useState<[number, number]>([0, 200]);

  return (
    <PokedexContext.Provider
      value={{
        types,
        setTypes,
        experience,
        setExperience,
        attack,
        setAttack,
      }}
    >
      <h1 className={s.h1}>
        800 <b>Pokemons</b> for you to choose your favorite
      </h1>
      <SearchBar />
      <Filters />
      <PokedexResult />
    </PokedexContext.Provider>
  );
};

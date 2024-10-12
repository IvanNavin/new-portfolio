'use client';
import { LoaderOverlay } from '@components/LoaderOverlay';
import { Pokemon } from '@containers/Pokedex/components/Pokemon';
import { usePokedexContext } from '@containers/Pokedex/hooks/usePokedexContext';
import { PokemonsFilterType } from '@root/prisma/db';
import { AnyType } from '@src/types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import s from './styles.module.scss';

export const PokedexResult = () => {
  const [pokemons, setPokemons] = useState<AnyType[]>([]);
  const [loading, setLoading] = useState(false);
  const { types, experience, attack } = usePokedexContext();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    const filters: Partial<PokemonsFilterType> = {
      minExperience: experience[0],
      maxExperience: experience[1],
      minAttack: attack[0],
      maxAttack: attack[1],
    };

    if (types.length) {
      filters.types = types;
    }

    if (search) {
      filters.name = search;
    }

    (async () => {
      const response = await fetch('/api/pokemons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      const data = await response.json();

      window.console.log(
        '%c 2 --> Line: 34||index.tsx\n data: ',
        'color:#0f0;',
        data,
      );

      setPokemons(data);
      setLoading(false);
    })();
  }, [types, experience, attack, searchParams, search]);

  return (
    <>
      {loading && <LoaderOverlay />}
      <div className={s.wrapper}>
        {pokemons.map((pokemon, index) => (
          <Pokemon
            key={pokemon.id}
            data={pokemon}
            isLast={index === pokemons.length - 1}
          />
        ))}
      </div>
    </>
  );
};

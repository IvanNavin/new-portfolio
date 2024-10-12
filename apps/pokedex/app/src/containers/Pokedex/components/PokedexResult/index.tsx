'use client';
import { usePokedexContext } from '@containers/Pokedex/hooks/usePokedexContext';
import { PokemonsFilterType } from '@repo/db';
import { AnyType } from '@src/types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const PokedexResult = () => {
  const { types, experience, attack } = usePokedexContext();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const [pokemons, setPokemons] = useState<AnyType[]>([]);

  useEffect(() => {
    // const queryParams = buildQueryParams(types, experience, attack, search);
    // Виконуємо запит до API з побудованими параметрами
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
    })();
  }, [types, experience, attack, searchParams, search]);

  return <div></div>;
};

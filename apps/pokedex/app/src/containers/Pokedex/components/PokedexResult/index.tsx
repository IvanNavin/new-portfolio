'use client';
import { LoaderOverlay } from '@components/LoaderOverlay';
import { Pokemon } from '@containers/Pokedex/components/Pokemon';
import { usePokedexContext } from '@containers/Pokedex/hooks/usePokedexContext';
import {
  useDebouncedValue,
  useIntersection,
  usePrevious,
} from '@mantine/hooks';
import { getUniqueData } from '@repo/utils';
import { PokemonsFilterType } from '@root/prisma/db';
import { AnyType } from '@src/types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import s from './styles.module.scss';

export const PokedexResult = () => {
  const [pokemons, setPokemons] = useState<AnyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { types, experience, attack } = usePokedexContext();
  const [debouncedExperience] = useDebouncedValue(experience, 500);
  const [debouncedAttack] = useDebouncedValue(attack, 500);
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const { ref, entry } = useIntersection<HTMLDivElement>({
    threshold: 1,
  });
  const prevPage = usePrevious(page);

  const fetchPokemons = async (page: number) => {
    setLoading(true);

    const filters: Partial<PokemonsFilterType> = {
      minExperience: debouncedExperience[0],
      maxExperience: debouncedExperience[1],
      minAttack: debouncedAttack[0],
      maxAttack: debouncedAttack[1],
      page,
      limit: 18,
    };

    if (types.length) {
      filters.types = types;
    }

    if (debouncedSearch) {
      filters.name = debouncedSearch;
    }

    const response = await fetch('/api/pokemons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    const data = await response.json();

    setPokemons((prevPokemons) => getUniqueData([...prevPokemons, ...data]));
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
    setPokemons([]);
    void fetchPokemons(1);
  }, [types, debouncedExperience, debouncedAttack, debouncedSearch]);

  useEffect(() => {
    if (entry?.isIntersecting) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [entry]);

  useEffect(() => {
    if (page > 1 && page !== prevPage && !loading) {
      void fetchPokemons(page);
    }
  }, [page]);

  return (
    <>
      {loading && <LoaderOverlay />}
      <div className={s.wrapper}>
        {pokemons.map((pokemon, index) => (
          <Pokemon
            key={pokemon.id}
            data={pokemon}
            ref={index === pokemons.length - 1 ? ref : null}
          />
        ))}
      </div>
    </>
  );
};

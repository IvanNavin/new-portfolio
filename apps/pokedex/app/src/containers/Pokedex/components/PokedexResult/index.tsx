'use client';
import { LoaderOverlay } from '@components/LoaderOverlay';
import { Pokemon } from '@containers/Pokedex/components/Pokemon';
import { usePokedexContext } from '@containers/Pokedex/hooks/usePokedexContext';
import { useDebouncedValue, useIntersection } from '@mantine/hooks';
import { PokemonsFilterType } from '@root/prisma/db';
import { PokemonType } from '@src/types/api-types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import s from './styles.module.scss';

const PAGE_LIMIT = 18;

// Accumulated infinite-scroll pages can repeat a pokemon; keep the last
// occurrence by id instead of re-stringifying the whole list every page.
const dedupeById = (list: PokemonType[]): PokemonType[] => {
  const byId = new Map<number, PokemonType>();
  list.forEach((pokemon) => byId.set(pokemon.id, pokemon));
  return Array.from(byId.values());
};

export const PokedexResult = () => {
  const [pokemons, setPokemons] = useState<PokemonType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const abortRef = useRef<AbortController | null>(null);
  const { types, experience, attack } = usePokedexContext();
  const [debouncedExperience] = useDebouncedValue(experience, 500);
  const [debouncedAttack] = useDebouncedValue(attack, 500);
  const searchParams = useSearchParams();
  // The search query is already debounced at the SearchBar (URL) level,
  // so we consume it directly here — no second debounce.
  const search = searchParams.get('search') || '';
  const { ref, entry } = useIntersection<HTMLDivElement>({
    threshold: 1,
  });

  const fetchPokemons = async (page: number, replace = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(false);

    const filters: Partial<PokemonsFilterType> = {
      minExperience: debouncedExperience[0],
      maxExperience: debouncedExperience[1],
      minAttack: debouncedAttack[0],
      maxAttack: debouncedAttack[1],
      page,
      limit: PAGE_LIMIT,
    };

    if (types.length) {
      filters.types = types;
    }

    if (search) {
      filters.name = search;
    }

    try {
      const response = await fetch('/api/pokemons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
        signal: controller.signal,
      });

      if (!response.ok) {
        setError(true);
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        setError(true);
        return;
      }

      // A short page means the server has nothing more to give.
      setHasMore(data.length === PAGE_LIMIT);
      setPokemons((prevPokemons) =>
        dedupeById(replace ? data : [...prevPokemons, ...data]),
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(true);
      }
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    void fetchPokemons(1, true);
  }, [types, debouncedExperience, debouncedAttack, search]);

  // Cancel any in-flight request when the list unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [entry, hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
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
      {!loading && error && (
        <p className={s.empty}>Something went wrong. Please try again.</p>
      )}
      {!loading && !error && pokemons.length === 0 && (
        <p className={s.empty}>No pokemons match your filters.</p>
      )}
    </>
  );
};

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
  // Synchronous "is a request in flight" guard — `loading` state updates a tick
  // too late and lets the observer fire duplicate page bumps (causing gaps).
  const fetchingRef = useRef(false);
  const { types, experience, attack } = usePokedexContext();
  const [debouncedExperience] = useDebouncedValue(experience, 500);
  const [debouncedAttack] = useDebouncedValue(attack, 500);
  const searchParams = useSearchParams();
  // The search query is already debounced at the SearchBar (URL) level,
  // so we consume it directly here — no second debounce.
  const search = searchParams.get('search') || '';
  // Watch a sentinel below the grid, with a generous rootMargin so the next
  // page loads before the user hits the bottom (a threshold-based watch on the
  // last card was blocked by the fixed footer covering it).
  const { ref, entry } = useIntersection<HTMLDivElement>({
    rootMargin: '600px',
  });

  const fetchPokemons = async (page: number, replace = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetchingRef.current = true;
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
        fetchingRef.current = false;
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

  // Advance a page whenever the sentinel is near the viewport. The synchronous
  // fetchingRef guard keeps bumps sequential (no skipped pages); pokemons.length
  // avoids firing before the first page has loaded.
  useEffect(() => {
    if (
      entry?.isIntersecting &&
      hasMore &&
      !fetchingRef.current &&
      pokemons.length
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [entry, hasMore, pokemons.length]);

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
          <Pokemon key={pokemon.id} data={pokemon} priority={index < 3} />
        ))}
      </div>
      {hasMore && !error && pokemons.length > 0 && (
        <div ref={ref} className={s.sentinel} aria-hidden='true' />
      )}
      {!loading && error && (
        <p className={s.empty}>Something went wrong. Please try again.</p>
      )}
      {!loading && !error && pokemons.length === 0 && (
        <p className={s.empty}>No pokemons match your filters.</p>
      )}
    </>
  );
};

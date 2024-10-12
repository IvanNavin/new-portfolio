import { IPokemons, PokemonsRequest } from '@src/interface/pokemons';
import { AnyType } from '@src/types';

export async function fetchPokemonList() {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
  const data = await res.json();

  return data.results;
}

async function fetchPokemonDetails(url: string): Promise<PokemonsRequest> {
  const res = await fetch(url);
  const data = await res.json();

  return {
    name_clean: data.name,
    abilities: data.abilities.map((ability: AnyType) => ability.ability.name),
    stats: {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      'special-attack': data.stats[3].base_stat,
      'special-defense': data.stats[4].base_stat,
      speed: data.stats[5].base_stat,
    },
    types: data.types.map((type: AnyType) => type.type.name),
    img: data?.sprites?.other?.dream_world?.front_default || null,
    name: data.name,
    base_experience: data.base_experience,
    height: data.height,
    id: data.id,
    is_default: data.is_default,
    order: data.order,
    weight: data.weight,
  };
}

export async function fetchAllPokemons(): Promise<IPokemons> {
  const pokemonList = await fetchPokemonList();
  const pokemons: PokemonsRequest[] = await Promise.all(
    pokemonList.map((pokemon: AnyType) => fetchPokemonDetails(pokemon.url)),
  );

  return {
    total: pokemons.length,
    pokemons,
  };
}

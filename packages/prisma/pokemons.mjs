import { PrismaClient } from "./generated/prisma-client/index.js";

import fetch from "node-fetch";

const prisma = new PrismaClient();

async function fetchPokemonList() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
  const data = await res.json();

  return data.results;
}

async function fetchPokemonDetails(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const data = await res.json();

  // Defensive: PokeAPI can return partial bodies under rate limiting — guard
  // every field so one bad record doesn't abort the whole seed (old Promise.all did).
  return {
    name_clean: data.name,
    abilities: Array.isArray(data.abilities)
      ? data.abilities.map((ability) => ability?.ability?.name).filter(Boolean)
      : [],
    stats: {
      hp: data?.stats?.[0]?.base_stat || 0,
      attack: data?.stats?.[1]?.base_stat || 0,
      defense: data?.stats?.[2]?.base_stat || 0,
      "special-attack": data?.stats?.[3]?.base_stat || 0,
      "special-defense": data?.stats?.[4]?.base_stat || 0,
      speed: data?.stats?.[5]?.base_stat || 0,
    },
    types: Array.isArray(data.types)
      ? data.types.map((type) => type?.type?.name).filter(Boolean)
      : [],
    img: data?.sprites?.other?.dream_world?.front_default || null,
    name: data.name,
    base_experience: data.base_experience || 0,
    height: data.height,
    id: data.id,
    is_default: data.is_default,
    order: data.order,
    weight: data.weight,
  };
}

async function loadPokemons() {
  const pokemonList = await fetchPokemonList();

  // Bounded batches + isolate failures so one dropped request doesn't sink the run.
  const BATCH_SIZE = 20;
  const pokemons = [];
  let failed = 0;
  for (let i = 0; i < pokemonList.length; i += BATCH_SIZE) {
    const slice = pokemonList.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      slice.map((pokemon) => fetchPokemonDetails(pokemon.url)),
    );
    for (const result of results) {
      if (result.status === "fulfilled") pokemons.push(result.value);
      else failed++;
    }
  }
  if (failed) {
    // eslint-disable-next-line no-console
    console.warn(`Skipped ${failed} Pokémon that failed to fetch.`);
  }

  for (const pokemon of pokemons) {
    await prisma.pokemon.create({
      data: {
        name: pokemon.name,
        name_clean: pokemon.name_clean,
        abilities: pokemon.abilities,
        types: pokemon.types,
        img: pokemon.img,
        base_experience: pokemon.base_experience,
        height: pokemon.height,
        weight: pokemon.weight,
        is_default: pokemon.is_default,
        order: pokemon.order,
        hp: pokemon.stats.hp,
        attack: pokemon.stats.attack,
        defense: pokemon.stats.defense,
        special_attack: pokemon.stats["special-attack"],
        special_defense: pokemon.stats["special-defense"],
        speed: pokemon.stats.speed,
      },
    });
  }
}

loadPokemons()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Pokemons loaded successfully");
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Error loading Pokemons:", error);
  })
  .finally(() => {
    prisma.$disconnect();
  });

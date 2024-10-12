import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";

const prisma = new PrismaClient();

async function fetchPokemonList() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
  const data = await res.json();

  return data.results;
}

async function fetchPokemonDetails(url) {
  const res = await fetch(url);
  const data = await res.json();

  return {
    name_clean: data.name,
    abilities: data.abilities.map((ability) => ability.ability.name),
    stats: {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      "special-attack": data.stats[3].base_stat,
      "special-defense": data.stats[4].base_stat,
      speed: data.stats[5].base_stat,
    },
    types: data.types.map((type) => type.type.name),
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
  const pokemons = await Promise.all(
    pokemonList.map((pokemon) => fetchPokemonDetails(pokemon.url)),
  );

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
    console.log("Pokemons loaded successfully");
  })
  .catch((error) => {
    console.error("Error loading Pokemons:", error);
  })
  .finally(() => {
    prisma.$disconnect();
  });

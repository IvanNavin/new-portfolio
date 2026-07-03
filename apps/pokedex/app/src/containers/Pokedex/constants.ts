// National Pokédex number → generation. Ranges are stable across the dex.
const GENERATION_MAX_ID = [151, 251, 386, 493, 649, 721, 809, 905, 1025];

export const getGeneration = (id: number): number => {
  const index = GENERATION_MAX_ID.findIndex((maxId) => id <= maxId);
  return index === -1 ? GENERATION_MAX_ID.length : index + 1;
};

export const pokemonTypes: string[] = [
  'normal',
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
  'stellar',
];

export type PokemonType = {
  name: string;
  url: string;
};

export type PokemonTypeList = PokemonType[];

export interface PokemonTypeResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonType[];
}

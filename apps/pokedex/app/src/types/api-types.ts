export type PokemonType = {
  id: number;
  name: string;
  name_clean: string;
  abilities: string[];
  types: string[];
  img: string | null;
  base_experience: number;
  height: number;
  weight: number;
  is_default: boolean;
  order: number;
  hp: number;
  attack: number;
  defense: number;
  special_attack: number;
  special_defense: number;
  speed: number;
};

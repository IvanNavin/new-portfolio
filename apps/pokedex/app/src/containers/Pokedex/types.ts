import { Dispatch, SetStateAction } from 'react';

export type PokedexContextType = {
  types: string[];
  setTypes: Dispatch<SetStateAction<string[]>>;
  experience: [number, number];
  setExperience: Dispatch<SetStateAction<[number, number]>>;
  attack: [number, number];
  setAttack: Dispatch<SetStateAction<[number, number]>>;
};

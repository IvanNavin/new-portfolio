import { PokedexContextType } from '@containers/Pokedex/types';
import { createContext } from 'react';

export const PokedexContext = createContext<PokedexContextType | null>(null);

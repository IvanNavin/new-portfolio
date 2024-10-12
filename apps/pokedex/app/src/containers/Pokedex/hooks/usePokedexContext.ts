import { PokedexContext } from '@containers/Pokedex/context';
import { useContext } from 'react';

export const usePokedexContext = () => {
  const ctx = useContext(PokedexContext);

  if (!ctx) {
    throw new Error(
      'usePokedexContext must be used within a PokedexContext.Provider',
    );
  }

  return ctx;
};

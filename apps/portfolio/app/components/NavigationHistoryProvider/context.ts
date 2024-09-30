import { createContext } from 'react';

import { NavigationHistoryContextProps } from './types';

export const NavigationHistoryContext =
  createContext<NavigationHistoryContextProps>({
    history: [],
    direction: 'forward',
  });

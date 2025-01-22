import { GlobalContextType } from '@app/types';
import { createContext } from 'react';

export const GlobalContext = createContext<Partial<GlobalContextType>>({});

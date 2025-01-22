import { GlobalContext } from '@app/context/globalContext';
import { useContext } from 'react';

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalContext');
  }

  return context;
};

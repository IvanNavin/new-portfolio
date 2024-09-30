import { useContext } from 'react';

import { NavigationHistoryContext } from './context';

export const useNavigationHistory = () => useContext(NavigationHistoryContext);

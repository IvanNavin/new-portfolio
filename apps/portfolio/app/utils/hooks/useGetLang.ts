import { LangContext } from '@app/i18n/context';
import { Locale } from '@root/i18n-config';
import { useContext } from 'react';

export const useGetLang = (): Locale => {
  const ctx = useContext(LangContext);

  if (!ctx) {
    throw new Error('useGetLang must be used within a LangProvider');
  }

  return ctx as Locale;
};

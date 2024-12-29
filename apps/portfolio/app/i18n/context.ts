'use client';
import { defaultLocale } from '@app/i18n/settings';
import { Locale } from '@root/i18n-config';
import { createContext } from 'react';

type LangContextType = Locale;

export const LangContext = createContext<LangContextType>(
  defaultLocale as Locale,
);

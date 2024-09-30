'use client';
/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
} from 'react-i18next';

import {
  defaultLocale,
  getOptions,
  i18nCookieName,
  languages,
} from './settings';
import { AnyType } from '../types';

const runsOnServerSide = typeof window === 'undefined';

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
    preload: runsOnServerSide ? languages : [],
  });

export function useTranslation(
  lng = defaultLocale,
  ns = 'common',
  options: Record<string, AnyType> = {},
) {
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;
  const i18nCookie = Cookies.get(i18nCookieName);

  if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
    i18n.changeLanguage(lng);
  } else {
    const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage);

    useEffect(() => {
      if (activeLng === i18n.resolvedLanguage) return;

      setActiveLng(i18n.resolvedLanguage);
    }, [activeLng, i18n.resolvedLanguage]);

    useEffect(() => {
      if (!lng || i18n.resolvedLanguage === lng) return;

      i18n.changeLanguage(lng);
    }, [lng, i18n]);

    useEffect(() => {
      if (i18nCookie === lng) return;

      Cookies.set(i18nCookieName, lng, { path: '/' });
    }, [lng, i18nCookie]);
  }

  return ret;
}

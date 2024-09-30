import { languages } from '@i18n/settings';

export const updateUrlLang = (lng: string) => {
  const { pathname, search } = window.location;
  const searchParams = new URLSearchParams(search);

  // Break the path into parts
  const segments = pathname.split('/').filter(Boolean);

  // Check whether the first segment is a language parameter
  if (languages.includes(segments[0])) {
    segments[0] = lng; // replace the current locale
  } else {
    segments.unshift(lng); // if the locale is missing add it to the beginning
  }

  // Collect a new path and save the query parameters
  const newPathname = `/${segments.join('/')}`;

  return `${newPathname}${searchParams.size ? `?${searchParams.toString()}` : ''}`;
};

import type { MetadataRoute } from 'next';

import { i18n } from '../i18n-config';

const SITE_URL = 'https://holovko-ivan.vercel.app';

const ROUTES = [
  '',
  '/about',
  '/my-works',
  '/contact',
  '/talks',
  '/talks/accessibility',
  '/talks/regexp',
  '/talks/jest',
  '/talks/type-vs-interface',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return i18n.locales.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${SITE_URL}/${locale}${route}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.7,
    })),
  );
}

import path from 'node:path';

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // У ~/www кілька lock-файлів — явно фіксуємо корінь монорепо
  turbopack: {
    root: path.join(import.meta.dirname, '../..'),
  },
};

export default withNextIntl(nextConfig);

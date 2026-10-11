import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NOTE: deliberately no `turbopack.root`. Next warns that it inferred the
  // workspace root from a stray lockfile in ~/www, but pinning the root — to
  // either the monorepo or this app — breaks the React Client Manifest under
  // pnpm (every "use client" module fails to resolve). The warning is cosmetic;
  // the breakage is not.
  images: {
    // TMDB serves every poster/backdrop/profile image from this one host.
    remotePatterns: [{ protocol: 'https', hostname: 'image.tmdb.org' }],
  },
};

export default withNextIntl(nextConfig);

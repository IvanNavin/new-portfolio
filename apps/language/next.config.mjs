import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nullGoogleClientId = 'nullGoogleClientId';
const nullGoogleClientSecret = 'nullGoogleClientSecret';
const nullRapidApiKey = 'nullRapidApiKey';
const nullRapidApiHost = 'nullRapidApiHost';
const nullDataBaseUrl = 'nullDataBaseUrl';
const nullAuthSecret = 'nullAuthSecret';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['src'],
  },
  transpilePackages: ['@repo/utils'],
  reactStrictMode: false,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    // The Prisma client is generated to a custom workspace location
    // (@repo/prisma → packages/prisma/generated), which Next's standalone
    // tracing doesn't follow — so the query-engine .node binary never ships
    // with the function and Prisma fails at runtime with "could not locate
    // the Query Engine". Widen the tracing root to the monorepo and
    // force-include the engine binaries.
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingIncludes: {
      '**/*': ['../../packages/prisma/generated/prisma-client/*.node'],
    },
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? nullGoogleClientId,
    NEXT_PUBLIC_GOOGLE_CLIENT_SECRET:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET ?? nullGoogleClientSecret,
    X_RAPIDAPI_KEY: process.env.X_RAPIDAPI_KEY ?? nullRapidApiKey,
    X_RAPIDAPI_HOST: process.env.X_RAPIDAPI_HOST ?? nullRapidApiHost,
    DATABASE_URL: process.env.DATABASE_URL ?? nullDataBaseUrl,
    NEXT_PUBLIC_AUTH_SECRET:
      process.env.NEXT_PUBLIC_AUTH_SECRET ?? nullAuthSecret,
  },
};

export default nextConfig;

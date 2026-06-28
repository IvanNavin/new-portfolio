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
  experimental: {
    // Keep Prisma out of the bundle and force its query-engine binary into the
    // serverless function's file trace. @repo/prisma is generated to a custom
    // workspace location, so neither Next nor Vercel ships the engine on their
    // own → "could not locate the Query Engine" at runtime.
    serverComponentsExternalPackages: ['@prisma/client', '@repo/prisma'],
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

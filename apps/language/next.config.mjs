import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// @repo/prisma generates its client (and engine) to a custom workspace
// location. At runtime on Vercel the bundled client searches for the engine
// relative to THIS app (/var/task/apps/<app>/generated/prisma-client), not the
// packages/ folder where it actually lives. So copy the Linux query-engine
// binary into the app's own generated/ dir at build start, then trace it into
// the function — landing it exactly where Prisma looks.
const engineSrc = path.join(
  __dirname,
  '../../packages/prisma/generated/prisma-client',
);
const engineDst = path.join(__dirname, 'generated/prisma-client');
try {
  fs.mkdirSync(engineDst, { recursive: true });
  for (const file of fs.readdirSync(engineSrc)) {
    if (file.endsWith('.so.node')) {
      fs.copyFileSync(path.join(engineSrc, file), path.join(engineDst, file));
    }
  }
} catch (err) {
  console.warn('prisma engine copy skipped:', err.message);
}

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
    serverComponentsExternalPackages: ['@prisma/client', '@repo/prisma'],
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingIncludes: {
      '**/*': ['./generated/prisma-client/*.node'],
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

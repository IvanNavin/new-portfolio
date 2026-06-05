import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Prisma's @repo/prisma workspace lives outside apps/devpulse, and its
  // Linux engine binary (libquery_engine-rhel-*.so.node) is loaded by
  // require() at runtime — Next's static-import tracing misses it.
  // outputFileTracingRoot anchors path resolution at the monorepo, then
  // every DB-touching route declares the whole generated/prisma-client/
  // folder as required so Vercel ships the .so alongside the function.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  outputFileTracingIncludes: {
    '/': ['../../packages/prisma/generated/prisma-client/**/*'],
    '/admin': ['../../packages/prisma/generated/prisma-client/**/*'],
    '/saved': ['../../packages/prisma/generated/prisma-client/**/*'],
    '/feed.xml': ['../../packages/prisma/generated/prisma-client/**/*'],
    '/api/by-urls': ['../../packages/prisma/generated/prisma-client/**/*'],
    '/api/cron/fetch-news': [
      '../../packages/prisma/generated/prisma-client/**/*',
    ],
  },
  serverExternalPackages: ['@prisma/client', '@repo/prisma'],
};

export default nextConfig;

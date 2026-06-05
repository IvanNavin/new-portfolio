import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  // Prisma's @repo/prisma workspace lives outside apps/devpulse, and its
  // platform-specific engine binary (libquery_engine-*.so.node) is loaded
  // dynamically by the client — File Tracing's static analysis misses it.
  // Pinning the trace root to the monorepo and explicitly including the
  // whole generated/prisma-client/ folder lets the binary ship.
  // Globs are resolved relative to outputFileTracingRoot.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  outputFileTracingIncludes: {
    '/': ['./packages/prisma/generated/prisma-client/**/*'],
    '/admin': ['./packages/prisma/generated/prisma-client/**/*'],
    '/saved': ['./packages/prisma/generated/prisma-client/**/*'],
    '/feed.xml': ['./packages/prisma/generated/prisma-client/**/*'],
    '/api/by-urls': ['./packages/prisma/generated/prisma-client/**/*'],
    '/api/cron/fetch-news': ['./packages/prisma/generated/prisma-client/**/*'],
  },
  serverExternalPackages: ['@prisma/client', '@repo/prisma'],
};

export default nextConfig;

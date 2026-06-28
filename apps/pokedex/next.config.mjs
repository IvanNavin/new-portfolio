import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app'],
  },
  transpilePackages: ['@repo/utils'],
  reactStrictMode: false,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    // The Prisma client is generated to a custom workspace location
    // (@repo/prisma → packages/prisma/generated), which Next's standalone
    // file tracing doesn't follow — so the query-engine .node binary never
    // ships with the function and Prisma fails at runtime with
    // "could not locate the Query Engine". Widen the tracing root to the
    // monorepo and force-include the engine binaries.
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingIncludes: {
      '**/*': ['../../packages/prisma/generated/prisma-client/*.node'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

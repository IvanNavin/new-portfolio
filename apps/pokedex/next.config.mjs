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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

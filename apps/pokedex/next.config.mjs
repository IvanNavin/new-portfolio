/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app'],
  },
  transpilePackages: ['@repo/utils'],
  reactStrictMode: false,
  swcMinify: true,
  // Ship the Prisma client (@repo/prisma) and its query-engine binary with the
  // serverless function instead of bundling it — mirrors devpulse, the one
  // Prisma app here that deploys cleanly. With `output: 'standalone'` the
  // engine was traced to a path the Vercel function couldn't find, so Prisma
  // failed at runtime with "could not locate the Query Engine".
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@repo/prisma'],
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

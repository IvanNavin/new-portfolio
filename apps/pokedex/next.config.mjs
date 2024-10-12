/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app'],
  },
  transpilePackages: ['@repo/utils'],
  reactStrictMode: false,
  swcMinify: true,
  output: 'standalone',
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

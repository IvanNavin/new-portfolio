/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app'],
  },
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

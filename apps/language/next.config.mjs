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

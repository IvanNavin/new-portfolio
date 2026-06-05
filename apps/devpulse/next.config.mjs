/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Prisma client travels with its Neon driver adapter (no native engine).
  serverExternalPackages: ['@prisma/client', '@repo/prisma'],
};

export default nextConfig;

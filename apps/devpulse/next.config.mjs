/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // No `output: 'standalone'` — Vercel's default function packaging handles
  // workspace deps (@repo/prisma + its dynamically-loaded Prisma engine .so)
  // correctly. Standalone mode strips them and forces fragile outputFileTracing
  // workarounds.
  serverExternalPackages: ['@prisma/client', '@repo/prisma'],
};

export default nextConfig;

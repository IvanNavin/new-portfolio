import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// @repo/prisma generates its client (and engine) to a custom workspace
// location. At runtime on Vercel the bundled client searches for the engine
// relative to THIS app (/var/task/apps/<app>/generated/prisma-client), not the
// packages/ folder where it actually lives. So copy the Linux query-engine
// binary into the app's own generated/ dir at build start, then trace it into
// the function — landing it exactly where Prisma looks.
const engineSrc = path.join(
  __dirname,
  '../../packages/prisma/generated/prisma-client',
);
const engineDst = path.join(__dirname, 'generated/prisma-client');
try {
  fs.mkdirSync(engineDst, { recursive: true });
  for (const file of fs.readdirSync(engineSrc)) {
    if (file.endsWith('.so.node')) {
      fs.copyFileSync(path.join(engineSrc, file), path.join(engineDst, file));
    }
  }
} catch (err) {
  console.warn('prisma engine copy skipped:', err.message);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app'],
  },
  transpilePackages: ['@repo/utils'],
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@repo/prisma'],
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingIncludes: {
      '**/*': ['./generated/prisma-client/*.node'],
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

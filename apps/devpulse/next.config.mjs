import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  // Prisma's @repo/prisma workspace lives outside apps/devpulse, and its
  // platform-specific engine binary (libquery_engine-*.so.node) doesn't get
  // traced by default. Explicitly include the rhel binary so the standalone
  // bundle works on Vercel's Linux runtime.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  outputFileTracingIncludes: {
    '/**/*': [
      '../../packages/prisma/generated/prisma-client/libquery_engine-rhel-openssl-3.0.x.so.node',
      '../../packages/prisma/generated/prisma-client/schema.prisma',
    ],
  },
  serverExternalPackages: ['@prisma/client', '@repo/prisma'],
};

export default nextConfig;

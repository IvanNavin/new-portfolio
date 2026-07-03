import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import type { NextConfig } from 'next';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

// @repo/prisma generates its client (and query engine) to a custom workspace
// location. At runtime on Vercel the bundled client searches for the engine
// relative to THIS app (/var/task/apps/visit-stat/generated/prisma-client),
// not the packages/ folder where it actually lives. So copy the Linux engine
// binary into the app's own generated/ dir at build start, then trace it into
// the function — landing it exactly where Prisma looks.
const engineSrc = path.join(
  currentDir,
  '../../packages/prisma/generated/prisma-client',
);
const engineDst = path.join(currentDir, 'generated/prisma-client');
try {
  fs.mkdirSync(engineDst, { recursive: true });
  for (const file of fs.readdirSync(engineSrc)) {
    if (file.endsWith('.so.node')) {
      fs.copyFileSync(path.join(engineSrc, file), path.join(engineDst, file));
    }
  }
} catch (err) {
  console.warn('prisma engine copy skipped:', (err as Error).message);
}

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@repo/prisma'],
  outputFileTracingRoot: path.join(currentDir, '../../'),
  outputFileTracingIncludes: {
    '**/*': ['./generated/prisma-client/*.node'],
  },
};

export default nextConfig;

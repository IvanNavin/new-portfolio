import { PrismaClient } from '@repo/prisma';

// Reuse a single client across HMR reloads in dev; a fresh `new PrismaClient()`
// per reload exhausts the Neon connection pool. Query logging is dev-only —
// logging every query (with params) in production leaks data and adds overhead.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    process.env.NODE_ENV !== 'production'
      ? { log: ['query', 'info', 'warn', 'error'] }
      : { log: ['warn', 'error'] },
  );

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

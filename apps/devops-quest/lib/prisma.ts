import { PrismaClient } from '../generated/prisma-client';

/**
 * Lazy singleton. The game is fully playable with no database at all, so a
 * missing POSTGRES_PRISMA_URL must not throw at module load — it only means
 * progress sync is unavailable, which the API routes report politely.
 */
const globalForPrisma = globalThis as unknown as {
  __devopsQuestPrisma?: PrismaClient;
};

export const isDatabaseConfigured = (): boolean =>
  typeof process.env.POSTGRES_PRISMA_URL === 'string' &&
  process.env.POSTGRES_PRISMA_URL.length > 0;

export const getPrisma = (): PrismaClient => {
  if (!globalForPrisma.__devopsQuestPrisma) {
    globalForPrisma.__devopsQuestPrisma = new PrismaClient();
  }
  return globalForPrisma.__devopsQuestPrisma;
};

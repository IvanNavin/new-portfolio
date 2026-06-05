import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@repo/prisma";

declare global {
  // eslint-disable-next-line no-var
  var __devpulsePrisma: PrismaClient | undefined;
}

/**
 * Uses Prisma's Neon driver adapter instead of the binary query engine.
 *
 * Why: Vercel Functions don't bundle the workspace-installed
 * libquery_engine-rhel-openssl-3.0.x.so.node — Next.js File Tracing can't
 * follow Prisma's runtime require() — so deploys crash with
 * PrismaClientInitializationError. The adapter routes queries through
 * @neondatabase/serverless instead, which is just an HTTPS POST to Neon's
 * SQL-over-HTTP endpoint. No native binary, no tracing surprises.
 *
 * Requires `previewFeatures = ["driverAdapters"]` in packages/prisma/schema.
 */
function makeClient(): PrismaClient {
  const connectionString = process.env.POSTGRES_PRISMA_URL;
  if (!connectionString) {
    throw new Error(
      "POSTGRES_PRISMA_URL is not set — devpulse cannot connect to Postgres.",
    );
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__devpulsePrisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__devpulsePrisma = prisma;
}

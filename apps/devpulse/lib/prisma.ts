import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@repo/prisma";
import ws from "ws";

// Tell @neondatabase/serverless which WebSocket implementation to use.
// In browsers this is the native WebSocket; in Vercel Node Functions we
// need to hand it the `ws` package explicitly or queries hang on connect.
neonConfig.webSocketConstructor = ws;

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
 * @neondatabase/serverless instead (WebSocket → Neon's wire protocol).
 * No native binary, no tracing surprises.
 *
 * Requires `previewFeatures = ["driverAdapters"]` in packages/prisma/schema.
 */
function makeClient(): PrismaClient {
  // Empty string is acceptable here — we'd rather get a clear Prisma error
  // at query time than throw during build-time page-data collection where
  // sensitive env vars aren't injected on Vercel.
  const connectionString = process.env.POSTGRES_PRISMA_URL ?? "";
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__devpulsePrisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__devpulsePrisma = prisma;
}

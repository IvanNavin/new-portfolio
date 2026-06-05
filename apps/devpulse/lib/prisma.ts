import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __devpulsePrisma: PrismaClient | undefined;
}

/**
 * Standard Prisma client targeting the local apps/devpulse/prisma/schema.
 * Generated client lives in node_modules/@prisma/client (default location),
 * which Vercel's Build Output API ships with the function automatically —
 * no File Tracing workarounds or driver adapters needed.
 *
 * Migrations remain centralized in packages/prisma; this app only reads/
 * writes the NewsItem table.
 */
export const prisma = globalThis.__devpulsePrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__devpulsePrisma = prisma;
}

import { PrismaClient } from "@repo/prisma";

declare global {
  // eslint-disable-next-line no-var
  var __devpulsePrisma: PrismaClient | undefined;
}

export const prisma = globalThis.__devpulsePrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__devpulsePrisma = prisma;
}

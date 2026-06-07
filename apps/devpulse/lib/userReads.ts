import { prisma } from "./prisma";

export async function getUserReadUrls(userId: string): Promise<string[]> {
  const rows = await prisma.devpulseReadItem.findMany({
    where: { userId },
    select: { url: true },
  });
  return rows.map((r) => r.url);
}

export async function addRead(userId: string, url: string): Promise<void> {
  await prisma.devpulseReadItem.upsert({
    where: { userId_url: { userId, url } },
    create: { userId, url },
    update: {},
  });
}

export async function removeRead(userId: string, url: string): Promise<void> {
  await prisma.devpulseReadItem.deleteMany({ where: { userId, url } });
}

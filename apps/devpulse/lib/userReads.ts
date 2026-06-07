import { prisma } from "./prisma";

export async function getUserReadUrls(userId: string): Promise<string[]> {
  const rows = await prisma.devpulseReadItem.findMany({
    where: { userId },
    select: { url: true },
  });
  return rows.map((r) => r.url);
}

/** Cap matched to dismissed — read marks accumulate naturally as a
 *  side-effect of ReadOnClick, so a heavy user with many sessions
 *  could pile up. Soft-dropping past the cap keeps a runaway tab
 *  loop from clogging Postgres. */
const MAX_READ = 10000;

export async function addRead(userId: string, url: string): Promise<void> {
  const count = await prisma.devpulseReadItem.count({ where: { userId } });
  if (count >= MAX_READ) {
    const exists = await prisma.devpulseReadItem.findUnique({
      where: { userId_url: { userId, url } },
      select: { id: true },
    });
    if (!exists) return;
  }
  await prisma.devpulseReadItem.upsert({
    where: { userId_url: { userId, url } },
    create: { userId, url },
    update: {},
  });
}

export async function removeRead(userId: string, url: string): Promise<void> {
  await prisma.devpulseReadItem.deleteMany({ where: { userId, url } });
}

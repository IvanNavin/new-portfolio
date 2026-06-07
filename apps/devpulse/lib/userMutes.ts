import { prisma } from "./prisma";

export type UserMute = {
  id: string;
  pattern: string;
};

export async function listUserMutes(userId: string): Promise<UserMute[]> {
  const rows = await prisma.devpulseMute.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({ id: r.id, pattern: r.pattern }));
}

export type AddMuteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function addUserMute(
  userId: string,
  pattern: string,
): Promise<AddMuteResult> {
  const p = pattern.trim().slice(0, 80);
  if (!p) return { ok: false, error: "Pattern is empty." };
  // De-dupe by checking existing patterns for this user — cheap because
  // most users will have a handful, and we avoid a partial-unique-index
  // migration.
  const existing = await prisma.devpulseMute.findFirst({
    where: { userId, pattern: p },
    select: { id: true },
  });
  if (existing) return { ok: true, id: existing.id };
  // Anti-abuse cap.
  const MAX_MUTES = 100;
  if ((await prisma.devpulseMute.count({ where: { userId } })) >= MAX_MUTES) {
    return {
      ok: false,
      error: `You've hit the ${MAX_MUTES}-mute cap. Remove one before adding another.`,
    };
  }
  const created = await prisma.devpulseMute.create({
    data: { userId, pattern: p },
    select: { id: true },
  });
  return { ok: true, id: created.id };
}

export async function removeUserMute(
  userId: string,
  id: string,
): Promise<void> {
  await prisma.devpulseMute.deleteMany({ where: { id, userId } });
}

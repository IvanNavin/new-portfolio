import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/lib/auth';
import { getPrisma, isDatabaseConfigured } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Bounded so one account can't grow the shared Hobby-tier database. */
const MAX_MISSIONS = 500;

const recordSchema = z.object({
  stars: z.number().int().min(1).max(3),
  hintsUsed: z.number().int().min(0).max(99),
  xp: z.number().int().min(0).max(10_000),
  at: z.number().int().nonnegative(),
});

const payloadSchema = z.object({
  v: z.literal(1),
  missions: z.record(z.string().max(64), recordSchema),
});

export const GET = async () => {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'sync-unavailable' },
      { status: 501 },
    );
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 },
    );
  }

  const rows = await getPrisma().devopsQuestProgress.findMany({
    where: { userId: session.user.id },
    select: {
      missionId: true,
      stars: true,
      hintsUsed: true,
      xp: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    progress: {
      v: 1,
      missions: Object.fromEntries(
        rows.map((row) => [
          row.missionId,
          {
            stars: row.stars,
            hintsUsed: row.hintsUsed,
            xp: row.xp,
            at: row.updatedAt.getTime(),
          },
        ]),
      ),
    },
  });
};

/**
 * Upserts the whole local progress map. The database is a mirror of
 * localStorage, not the source of truth, so a record only ever moves up:
 * a replay with a worse result never overwrites a better one.
 */
export const PUT = async (request: Request) => {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'sync-unavailable' },
      { status: 501 },
    );
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-json' }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'bad-payload' },
      { status: 400 },
    );
  }

  const entries = Object.entries(parsed.data.missions).slice(0, MAX_MISSIONS);
  const prisma = getPrisma();
  const userId = session.user.id;

  const existing = await prisma.devopsQuestProgress.findMany({
    where: { userId },
    select: { missionId: true, stars: true, xp: true },
  });
  const before = new Map(existing.map((row) => [row.missionId, row]));

  const improved = entries.filter(([missionId, record]) => {
    const previous = before.get(missionId);
    return (
      !previous || record.xp > previous.xp || record.stars > previous.stars
    );
  });

  await prisma.$transaction(
    improved.map(([missionId, record]) =>
      prisma.devopsQuestProgress.upsert({
        where: { userId_missionId: { userId, missionId } },
        create: {
          userId,
          missionId,
          stars: record.stars,
          hintsUsed: record.hintsUsed,
          xp: record.xp,
        },
        update: {
          stars: record.stars,
          hintsUsed: record.hintsUsed,
          xp: record.xp,
        },
      }),
    ),
  );

  return NextResponse.json({ ok: true, saved: improved.length });
};

import { PrismaClient } from '@repo/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Drop visit rows older than this. Keeps the table from growing unbounded.
const RETENTION_YEARS = 1;

// GET /api/cron/purge — invoked daily by the Vercel cron (see vercel.json).
export const GET = async (req: NextRequest) => {
  // Vercel attaches `Authorization: Bearer <CRON_SECRET>` to cron invocations
  // once CRON_SECRET is set. Fail closed so this can't be triggered publicly
  // (and stays a no-op 401 until the secret is configured).
  if (
    req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - RETENTION_YEARS);

  try {
    const { count } = await prisma.visitStat.deleteMany({
      where: { timestamp: { lt: cutoff } },
    });

    return NextResponse.json({ deleted: count, cutoff: cutoff.toISOString() });
  } catch (error) {
    console.error('visit-stat purge failed:', error);
    return NextResponse.json({ error: 'Purge failed' }, { status: 500 });
  }
};

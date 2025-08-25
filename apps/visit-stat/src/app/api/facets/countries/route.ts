import { NextResponse } from 'next/server';
import { PrismaClient } from '@repo/prisma';

const prisma = new PrismaClient();

export async function GET() {
  const rows = await prisma.visitStat.groupBy({
    by: ['country'],
    where: {
      country: {
        not: null,
        notIn: [''],
      },
    },
    _count: { country: true },
    orderBy: { _count: { country: 'desc' } },
  });

  return NextResponse.json({
    items: rows.map((r) => ({
      code: r.country as string,
      count: r._count.country,
    })),
  });
}

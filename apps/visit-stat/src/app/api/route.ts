import { PrismaClient } from '@repo/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

type DeviceType = 'mobile' | 'tablet' | 'desktop';
type SortOrder = 'asc' | 'desc';

const ALLOWED_SORT = new Set([
  'timestamp',
  'domain',
  'path',
  'country',
  'city',
  'event',
]);

// Parse helpers
const asPositiveInt = (v: string | null, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

const asDate = (v: string | null) => {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

const pickSort = (by: string | null, order: string | null) => {
  const sortBy = by && ALLOWED_SORT.has(by) ? by : 'timestamp';
  const sortOrder: SortOrder = order === 'asc' ? 'asc' : 'desc';
  return { sortBy, sortOrder };
};

// GET /api
// Query params:
// page, pageSize, sortBy, sortOrder
// domain, path, event, country, deviceType, from, to, q
export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const page = asPositiveInt(searchParams.get('page'), 1);
    const pageSize = Math.min(
      asPositiveInt(searchParams.get('pageSize'), 50),
      200,
    );
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const { sortBy, sortOrder } = pickSort(
      searchParams.get('sortBy'),
      searchParams.get('sortOrder'),
    );

    const domain = searchParams.get('domain') || undefined;
    const path = searchParams.get('path') || undefined;
    const event = searchParams.get('event') || undefined;
    const country = searchParams.get('country') || undefined;
    const deviceType =
      (searchParams.get('deviceType') as DeviceType | null) || undefined;
    const from = asDate(searchParams.get('from'));
    const to = asDate(searchParams.get('to'));
    const q = searchParams.get('q') || undefined;

    // Build where
    const and: any[] = [];
    if (domain) and.push({ domain });
    if (path) and.push({ path: { contains: path, mode: 'insensitive' } });
    if (event) and.push({ event });
    if (country) and.push({ country });
    if (deviceType) and.push({ deviceType });
    if (from || to) {
      and.push({
        timestamp: {
          ...(from ? { gte: from } : {}),
          ...(to ? { lte: to } : {}),
        },
      });
    }
    if (q) {
      and.push({
        OR: [
          { domain: { contains: q, mode: 'insensitive' } },
          { path: { contains: q, mode: 'insensitive' } },
          { referrer: { contains: q, mode: 'insensitive' } },
          { ip: { contains: q } },
          { userAgent: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { region: { contains: q, mode: 'insensitive' } },
          { country: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    const where = and.length ? { AND: and } : {};

    const [items, total] = await Promise.all([
      prisma.visitStat.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
      }),
      prisma.visitStat.count({ where }),
    ]);

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
      sortBy,
      sortOrder,
    });
  } catch (e) {
    console.error('GET /api error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
};

// POST /api
// Body: { domain, path, referrer?, sessionId?, event?, extra? }
export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    // Get IP
    const fwd = req.headers.get('x-forwarded-for') || '';
    const real = req.headers.get('x-real-ip') || '';
    let ip = fwd ? fwd.split(',')[0].trim() : real;

    // Basic fallback
    if (!ip || ip === '::1' || ip === '127.0.0.1') ip = '';

    // Geo lookup
    type Geo = {
      ip?: string;
      country_code?: string | null;
      region_code?: string | null;
      city?: string | null;
      time_zone?: string | null;
      latitude?: number | null;
      longitude?: number | null;
    };
    let geo: Geo = {};
    try {
      const endpoint = ip
        ? `https://freegeoip.app/json/${ip}`
        : `https://freegeoip.app/json/`;
      const geoRes = await fetch(endpoint, {
        next: { revalidate: 60 * 60 * 12 },
      });
      if (geoRes.ok) geo = await geoRes.json();
      else console.error('freeGeoIP status:', geoRes.status);
    } catch (err) {
      console.error('Geo lookup failed:', err);
    }

    // Headers
    const userAgent = req.headers.get('user-agent') || '';
    const language = req.headers.get('accept-language')?.split(',')[0] || '';

    // Device type
    let deviceType: DeviceType = 'desktop';
    if (/mobile/i.test(userAgent)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet';

    const {
      domain,
      path,
      referrer,
      sessionId,
      event = 'pageview',
      extra,
    } = data;

    const item = await prisma.visitStat.create({
      data: {
        domain,
        path,
        country: geo.country_code || null,
        region: geo.region_code || null,
        city: geo.city || null,
        timeZone: geo.time_zone || null,
        latitude: geo.latitude ?? null,
        longitude: geo.longitude ?? null,
        ip: ip || geo.ip || '',
        userAgent,
        language,
        deviceType,
        referrer: referrer ?? null,
        sessionId: sessionId ?? null,
        event,
        extra: extra ?? null,
      },
    });

    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (e) {
    console.error('POST /api error:', e);
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
};

// PUT /api?id=<id>
// Body: partial VisitStat fields to update
export const PUT = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const body = await req.json();

    // Forbid immutable fields
    delete body.id;
    delete body.timestamp;

    const item = await prisma.visitStat.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error('PUT /api error:', e);
    return NextResponse.json(
      { error: 'Not found or invalid data' },
      { status: 400 },
    );
  }
};

// DELETE /api?id=<id>[&id=<id>...]  or Body: { ids: string[] }
export const DELETE = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    let ids = searchParams.getAll('id').flatMap((v) =>
      v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    );

    if (!ids.length) {
      try {
        const body = await req.json();
        if (Array.isArray(body?.ids))
          ids = body.ids
            .filter((x: unknown) => typeof x === 'string' && x.trim())
            .map((s: string) => s.trim());
      } catch {
        // Ignore empty body
      }
    }

    if (!ids.length)
      return NextResponse.json({ error: 'Missing ids' }, { status: 400 });

    const res = await prisma.visitStat.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ ok: true, deleted: res.count });
  } catch (e) {
    console.error('DELETE /api error:', e);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
};

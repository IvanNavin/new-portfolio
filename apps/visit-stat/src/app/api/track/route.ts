import { PrismaClient } from '@repo/prisma';
import { isBotUserAgent } from '@repo/utils';
import { NextRequest, NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// The portfolio SPA beacons here cross-origin. A text/plain body keeps it a
// CORS "simple" request (no preflight), and the browser never reads the
// response — so these headers are mostly for good measure.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS = () =>
  new NextResponse(null, { status: 204, headers: CORS_HEADERS });

const decodeHeader = (req: NextRequest, name: string): string | null => {
  const value = req.headers.get(name);
  return value ? decodeURIComponent(value) : null;
};

const toNumber = (value: string | null): number | null => {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

// POST /api/track — record one visit. Client-known fields come in the body;
// geo/ip/ua/language are derived from the visitor's request server-side.
export const POST = async (req: NextRequest) => {
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const domain = typeof body.domain === 'string' ? body.domain : '';
  const path = typeof body.path === 'string' ? body.path : '';
  if (!domain || !path) {
    return NextResponse.json(
      { error: 'domain and path are required' },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const userAgent = req.headers.get('user-agent') || '';
  if (isBotUserAgent(userAgent)) {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  // Accurate device/browser/os from the UA instead of a hand-rolled regex.
  const ua = new UAParser(userAgent).getResult();
  const deviceType =
    ua.device.type === 'mobile' || ua.device.type === 'tablet'
      ? ua.device.type
      : 'desktop';

  // Vercel resolves the visitor's geolocation at the edge — free, instant, no
  // third-party API (the old freegeoip.app lookup is long dead).
  const forwarded = req.headers.get('x-forwarded-for');
  const ip =
    (forwarded ? forwarded.split(',')[0].trim() : '') ||
    req.headers.get('x-real-ip') ||
    '';

  await prisma.visitStat.create({
    data: {
      domain,
      path,
      country: decodeHeader(req, 'x-vercel-ip-country'),
      region: decodeHeader(req, 'x-vercel-ip-country-region'),
      city: decodeHeader(req, 'x-vercel-ip-city'),
      timeZone: decodeHeader(req, 'x-vercel-ip-timezone'),
      latitude: toNumber(req.headers.get('x-vercel-ip-latitude')),
      longitude: toNumber(req.headers.get('x-vercel-ip-longitude')),
      ip,
      userAgent,
      language: req.headers.get('accept-language')?.split(',')[0] || null,
      deviceType,
      referrer: typeof body.referrer === 'string' ? body.referrer : null,
      sessionId: typeof body.sessionId === 'string' ? body.sessionId : null,
      event: typeof body.event === 'string' ? body.event : 'pageview',
      extra: {
        browser: ua.browser.name ?? null,
        os: ua.os.name ?? null,
        ...(body.extra && typeof body.extra === 'object'
          ? (body.extra as Record<string, unknown>)
          : {}),
      },
    },
  });

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
};

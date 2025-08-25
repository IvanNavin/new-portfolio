import { AnyType } from '@app/types';
import { PrismaClient } from '@repo/prisma';
import { isBotUserAgent } from '@repo/utils';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Get iP (take from Headers, because Next/Server is not always given req.ip)
  const forwarded = req.headers.get('x-forwarded-for');
  let ip = forwarded ? forwarded.split(',')[0].trim() : '';

  // Basic Fallback - IP API allows an empty IP (defines automatically)
  // But better clearly - because then works in both Dev and on the prod
  if (!ip || ip === '::1' || ip === '127.0.0.1') ip = '';

  // Geo info through public API (free)
  let geo: AnyType = {};
  try {
    const endpoint = ip
      ? `https://freegeoip.app/json/${ip}`
      : `https://freegeoip.app/json/`;
    const geoRes = await fetch(endpoint, {
      next: { revalidate: 60 * 60 * 12 },
    }); // cache 12h
    if (geoRes.ok) {
      geo = await geoRes.json();
    } else {
      window.console.error('freeGeoIp status:', geoRes.status);
    }
  } catch (e) {
    window.console.error('Geo lookup failed:', e);
  }

  // User-Agent
  const userAgent = req.headers.get('user-agent') || '';

  if (isBotUserAgent(userAgent)) return new NextResponse(null, { status: 204 });

  const language = req.headers.get('accept-language')?.split(',')[0] || '';

  // Device Type (Simple Detector)
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (/mobile/i.test(userAgent)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet';

  const { domain, path, referrer, sessionId, event = 'pageview', extra } = data;

  await prisma.visitStat.create({
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
      referrer,
      sessionId,
      event,
      extra,
    },
  });

  return NextResponse.json({ ok: true });
}

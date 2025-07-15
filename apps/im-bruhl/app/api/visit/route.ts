import { AnyType } from "@app/types";
import { PrismaClient } from "@repo/prisma";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Get iP (take from Headers, because Next/Server is not always given req.ip)
  const forwarded = req.headers.get("x-forwarded-for");
  let ip = forwarded ? forwarded.split(",")[0] : "";

  // Basic Fallback - IP API allows an empty IP (defines automatically)
  // But better clearly - because then works in both Dev and on the prod
  if (!ip || ip === "::1" || ip === "127.0.0.1") ip = ""; // Then IP API itself determines

  // Geo info through public API (free)
  let geo: AnyType = {};
  try {
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 60 * 60 * 12 },
    }); // cache 12h
    if (geoRes.ok) {
      geo = await geoRes.json();
    }
  } catch (e) {
    window.console.error(e);
  }

  // User-Agent
  const userAgent = req.headers.get("user-agent") || "";
  const language = req.headers.get("accept-language")?.split(",")[0] || "";

  // Device Type (Simple Detector)
  let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
  if (/mobile/i.test(userAgent)) deviceType = "mobile";
  else if (/tablet|ipad/i.test(userAgent)) deviceType = "tablet";

  const { domain, path, referrer, sessionId, event = "pageview", extra } = data;

  await prisma.visitStat.create({
    data: {
      domain,
      path,
      country: geo?.country || geo?.country_code || null,
      region: geo?.region || geo?.region_code || null,
      city: geo?.city || null,
      timeZone: geo?.timezone || null,
      latitude: geo?.latitude ?? geo?.lat ?? null,
      longitude: geo?.longitude ?? geo?.lon ?? null,
      ip: ip || geo?.ip || "",
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

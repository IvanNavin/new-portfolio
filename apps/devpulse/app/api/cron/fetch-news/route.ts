import { runFetch } from "@lib/fetchNews";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Bumped from 60s — the AI summary + tag pass adds ~500ms per item,
// so a 200-item backfill needs ~100s on top of normal fetch work.
// Vercel raised the cap to 300s on all plans (including Hobby) in
// the 2026 platform update.
export const maxDuration = 300;

/**
 * Cron entry point. Two auth modes:
 *  - Vercel Cron: requests carry an `Authorization: Bearer ${CRON_SECRET}` header
 *    auto-injected by the platform (set CRON_SECRET in env).
 *  - Manual ping: same header works from curl/postman for testing.
 *
 * If CRON_SECRET is unset we 503 — better than running unauthenticated on prod.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not configured" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const report = await runFetch();
  return NextResponse.json({ ok: true, report });
}

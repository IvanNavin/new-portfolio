import { NextRequest, NextResponse } from "next/server";

import { auth } from "@lib/auth";
import { addSaved, getUserSavedUrls, removeSaved } from "@lib/userState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET    → { urls: string[] }     — user's full saved list (auth required)
 * POST   → { url: string } adds it
 * DELETE → { url: string } removes it
 *
 * Unauth callers get 401 — clients should fall back to localStorage in
 * that case rather than calling this endpoint.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  const urls = await getUserSavedUrls(session.user.id);
  return NextResponse.json({ ok: true, urls });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let url: unknown;
  try {
    ({ url } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  if (typeof url !== "string" || !url) {
    return NextResponse.json(
      { ok: false, error: "missing url" },
      { status: 400 },
    );
  }
  await addSaved(session.user.id, url);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let url: unknown;
  try {
    ({ url } = await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  if (typeof url !== "string" || !url) {
    return NextResponse.json(
      { ok: false, error: "missing url" },
      { status: 400 },
    );
  }
  await removeSaved(session.user.id, url);
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@lib/auth";
import { addDismissed, getUserDismissedUrls } from "@lib/userState";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  → { urls: string[] }     — user's full dismissed list (auth required)
 * POST → { url: string } adds   (dismiss is one-way — no DELETE; the user
 *                                 can re-enable a source in /settings if
 *                                 they want it back).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  const urls = await getUserDismissedUrls(session.user.id);
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
  await addDismissed(session.user.id, url);
  return NextResponse.json({ ok: true });
}

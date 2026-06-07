import { auth } from "@lib/auth";
import { addRead, getUserReadUrls, removeRead } from "@lib/userReads";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET    → { urls: string[] }     — user's full read list
 * POST   → { url: string } marks it read
 * DELETE → { url: string } marks it unread
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }
  const urls = await getUserReadUrls(session.user.id);
  return NextResponse.json({ ok: true, urls });
}

async function readBodyUrl(req: NextRequest): Promise<string | null> {
  try {
    const body = await req.json();
    return typeof body?.url === "string" ? body.url : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ ok: false }, { status: 401 });
  const url = await readBodyUrl(req);
  if (!url) return NextResponse.json({ ok: false }, { status: 400 });
  await addRead(session.user.id, url);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ ok: false }, { status: 401 });
  const url = await readBodyUrl(req);
  if (!url) return NextResponse.json({ ok: false }, { status: 400 });
  await removeRead(session.user.id, url);
  return NextResponse.json({ ok: true });
}

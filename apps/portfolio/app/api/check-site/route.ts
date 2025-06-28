import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });

    return response.ok
      ? NextResponse.json({ available: true })
      : NextResponse.json({ available: false }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ available: false }, { status: 500 });
  }
}

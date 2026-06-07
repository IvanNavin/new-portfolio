import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
  <circle cx="12" cy="12" r="10" fill="#888" opacity="0.4"/>
  <text x="12" y="16" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#fff">?</text>
</svg>`;

const TIMEOUT_MS = 3000;
const CACHE_HEADERS = {
  "cache-control": "public, max-age=604800, immutable", // one week
};

async function tryFetch(url: string): Promise<Response | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "devpulse-bot/0.1" },
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!/image|icon/i.test(ct)) return null;
    // Some providers return a 1x1 tracking pixel as the "favicon" — skip
    // any payload under 100 bytes as suspicious.
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 100) return null;
    return new Response(buf, {
      headers: {
        "content-type": ct,
        ...CACHE_HEADERS,
      },
    });
  } catch {
    return null;
  }
}

/**
 * /api/favicon?host=example.com
 *
 * Server-side favicon proxy. Tries multiple upstream providers in order,
 * falls back to a neutral grey "?" SVG if none work. Always returns 200
 * so the browser console doesn't fill with red 404s — that was the
 * single loudest source of noise after switching from Google's s2
 * endpoint to DuckDuckGo's ip3 (both miss a long tail of hosts).
 *
 * Aggressive Cache-Control means subsequent page views are instant —
 * the browser keeps the image in its disk cache for a week.
 */
export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")?.trim() ?? "";
  if (!host || !/^[a-z0-9.-]+$/i.test(host)) {
    return new NextResponse(FALLBACK_SVG, {
      headers: { "content-type": "image/svg+xml", ...CACHE_HEADERS },
    });
  }

  const sources = [
    `https://icons.duckduckgo.com/ip3/${host}.ico`,
    `https://www.google.com/s2/favicons?domain=${host}&sz=32`,
    `https://${host}/favicon.ico`,
  ];
  for (const url of sources) {
    const got = await tryFetch(url);
    if (got) return got;
  }
  return new NextResponse(FALLBACK_SVG, {
    headers: { "content-type": "image/svg+xml", ...CACHE_HEADERS },
  });
}

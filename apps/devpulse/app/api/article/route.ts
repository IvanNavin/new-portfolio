import { prisma } from "@lib/prisma";
import { safeFetch } from "@lib/safeFetch";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Cap each invocation: the fresh path does a 10s safeFetch + JSDOM/Readability
// parse, so bound the function so a slow upstream can't pin it for minutes.
export const maxDuration = 20;

// Best-effort per-IP throttle for the EXPENSIVE (uncached) extraction path.
// Item ids are enumerable (by-urls returns them), so without this a script can
// amplify each cheap request into a 10s+ JSDOM parse — DoS / Vercel cost blowup.
// Fluid Compute reuses instances so this blunts floods; it isn't a hard
// cross-region guarantee (a shared store would be), but it's the right tier
// for a hobby aggregator and never throttles cached reads.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 15;
const extractionHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (extractionHits.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  recent.push(now);
  extractionHits.set(ip, recent);
  if (extractionHits.size > 5000) {
    for (const [k, v] of extractionHits) {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) extractionHits.delete(k);
    }
  }
  return recent.length > RATE_MAX;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// Readability does NOT sanitize (scripts + on* handlers survive), yet this HTML
// is rendered via dangerouslySetInnerHTML. Strip active content with the
// already-present JSDOM (no new dep) before caching/returning.
const DANGEROUS_TAGS = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "link",
  "meta",
  "base",
  "noscript",
  "template",
  "svg",
  "math",
  "frame",
  "frameset",
  "applet",
].join(",");
const URL_ATTRS = new Set([
  "href",
  "src",
  "xlink:href",
  "action",
  "formaction",
  "poster",
  "background",
]);
function sanitizeHtml(rawHtml: string): string {
  const { document } = new JSDOM(`<!DOCTYPE html><body>${rawHtml}</body>`)
    .window;

  document.querySelectorAll(DANGEROUS_TAGS).forEach((el) => el.remove());

  document.querySelectorAll("*").forEach((el) => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || name === "style") {
        el.removeAttribute(attr.name);
        continue;
      }
      if (URL_ATTRS.has(name)) {
        // Collapse control chars/whitespace so "java\tscript:" can't sneak by.
        const v = attr.value.replace(/[\u0000-\u0020]+/g, "").toLowerCase();
        const isUnsafe =
          v.startsWith("javascript:") ||
          v.startsWith("vbscript:") ||
          (v.startsWith("data:") && !v.startsWith("data:image/"));
        if (isUnsafe) el.removeAttribute(attr.name);
      }
    }
  });

  return document.body.innerHTML;
}

/**
 * /api/article?id=<newsItemId>
 *
 * Returns the cleaned article HTML rendered by Mozilla Readability so
 * the in-app reader drawer can display the full piece without leaving
 * devpulse. First hit per item runs the extractor + caches the result
 * back to news_item.cleanedHtml; subsequent hits are instant.
 *
 * Goes through safeFetch — same SSRF guard as the favicon proxy and
 * the cron RSS fetcher.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "id required" },
      { status: 400 },
    );
  }
  const item = await prisma.newsItem.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      title: true,
      cleanedHtml: true,
      source: true,
    },
  });
  if (!item) {
    return NextResponse.json(
      { ok: false, error: "not found" },
      { status: 404 },
    );
  }
  if (item.cleanedHtml) {
    return NextResponse.json(
      {
        ok: true,
        title: item.title,
        source: item.source,
        url: item.url,
        // Re-sanitize on read: rows cached before this may hold active content.
        html: sanitizeHtml(item.cleanedHtml),
        cached: true,
      },
      {
        headers: {
          "cache-control": "private, max-age=3600",
        },
      },
    );
  }

  // Only the uncached path is expensive — throttle it, never cached reads.
  if (isRateLimited(clientIp(req))) {
    return NextResponse.json(
      { ok: false, error: "rate limited" },
      { status: 429, headers: { "retry-after": "60" } },
    );
  }

  // Fresh extraction. safeFetch enforces SSRF rules + 5s default
  // timeout; raise to 10s here since first-byte for a CMS-heavy
  // article page often exceeds the default.
  let html: string;
  try {
    const res = await safeFetch(item.url, {
      timeoutMs: 10_000,
      headers: {
        "user-agent": "devpulse-bot/0.1 (+reader)",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5",
      },
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `upstream ${res.status}` },
        { status: 502 },
      );
    }
    html = await res.text();
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "fetch failed" },
      { status: 502 },
    );
  }

  let cleaned: string | null = null;
  try {
    const dom = new JSDOM(html, { url: item.url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    cleaned = article?.content ?? null;
  } catch {
    cleaned = null;
  }
  if (!cleaned) {
    return NextResponse.json(
      { ok: false, error: "no readable content" },
      { status: 422 },
    );
  }

  // Cap stored body at 200 KB so a freakishly long article doesn't
  // blow our Hobby DB budget. The reader still shows what came
  // through; truncation is invisible to the user.
  const capped = cleaned.length > 200_000 ? cleaned.slice(0, 200_000) : cleaned;

  // Sanitize before caching so the DB never stores an XSS payload.
  const safe = sanitizeHtml(capped);

  // Fire-and-forget cache write — don't wait for the DB round trip
  // before returning the body to the user.
  prisma.newsItem
    .update({ where: { id: item.id }, data: { cleanedHtml: safe } })
    .catch(() => {});

  return NextResponse.json(
    {
      ok: true,
      title: item.title,
      source: item.source,
      url: item.url,
      html: safe,
      cached: false,
    },
    {
      headers: {
        "cache-control": "private, max-age=600",
      },
    },
  );
}

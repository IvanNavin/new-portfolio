/**
 * Minimal RSS 2.0 + Atom 1.0 parser.
 *
 * Why hand-rolled: the feeds we consume are well-formed and the only fields
 * we need are title / link / date / summary. Pulling in fast-xml-parser to
 * extract four strings is overkill; if a source ever breaks parsing we skip
 * it and log, the rest of the pipeline keeps moving.
 */

export type ParsedItem = {
  url: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  /** HN points / Lobsters score when the feed emits one; null otherwise. */
  engagement: number | null;
};

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&[a-z]+;/gi, (m) => HTML_ENTITIES[m] ?? m);
}

function stripCdata(s: string): string {
  const m = s.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return m ? m[1] : s;
}

function stripHtml(s: string): string {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s: string, max = 280): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (
    (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…"
  );
}

/** Extract the first <tag>...</tag> block's content. */
function pickTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  return m ? stripCdata(m[1]).trim() : null;
}

/** Atom links can be self-closing: <link href="..." rel="alternate"/>. */
function pickAtomLink(block: string): string | null {
  // Prefer rel="alternate" if present, otherwise first <link>.
  const altRe = /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i;
  const alt = block.match(altRe);
  if (alt) return alt[1];
  const hrefRe = /<link[^>]*href=["']([^"']+)["']/i;
  const any = block.match(hrefRe);
  return any ? any[1] : null;
}

function parseDate(raw: string | null): Date | null {
  if (!raw) return null;
  const d = new Date(raw.trim());
  return isNaN(d.getTime()) ? null : d;
}

/**
 * HN-style RSS bodies are mostly link-submission boilerplate. The
 * actual story content lives behind the URL, not in the feed body —
 * the body just repeats the URLs and the score. Strip these so the
 * card excerpt stops showing "Article URL: ... Comments URL: ...
 * Points: 298 # Comments: 69" and the AI summary doesn't waste
 * tokens summarizing a metadata blob.
 */
function stripFeedBoilerplate(s: string): string {
  return s
    .replace(/Article URL:\s*\S+/gi, "")
    .replace(/Comments URL:\s*\S+/gi, "")
    .replace(/Points:\s*\d+/gi, "")
    .replace(/#\s*Comments:\s*\d+/gi, "")
    .replace(/\bhope you enjoy\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(raw: string | null, max = 280): string {
  if (!raw) return "";
  // Decode entities FIRST: GitHub/Atom feeds often ship content as
  // `<content type="html">&lt;h3&gt;...&lt;/h3&gt;</content>`, so the HTML
  // tags are XML-entity-encoded. If we stripHtml before decoding we miss
  // them entirely and the page shows raw "<h3>...</h3>" text.
  // Then strip tags. Then decode again to catch any nested entities that
  // were inside the now-removed HTML (e.g. &nbsp; that survived).
  const decoded = decodeEntities(stripHtml(decodeEntities(raw)));
  const cleaned = stripFeedBoilerplate(decoded);
  // Keep whatever survives — even a short remnant is more useful as
  // a card preview than the "Open the story to read" placeholder.
  // The AI helper applies its own 60-char floor before spending tokens.
  return truncate(cleaned, max);
}

function cleanTitle(raw: string | null): string {
  if (!raw) return "";
  return decodeEntities(stripHtml(decodeEntities(raw)));
}

/**
 * Detects pre-release builds (canary, dev, rc, beta, alpha, experimental,
 * nightly, preview, snapshot). Requires the title to contain a digit
 * AND a pre-release marker bounded by whitespace/separators — so blog
 * posts about "canary builds" in prose stay visible, but anything that
 * looks like a versioned pre-release (anywhere in the title) gets skipped.
 *
 *   "v16.3.0-canary.41"          → true   (skip)
 *   "Turborepo v2.9.17-canary.3" → true   (skip — marker not at start)
 *   "Chrome 150 beta"            → true   (skip — version + word marker)
 *   "v6.20.0"                    → false  (keep — no marker)
 *   "Why we ship canaries"       → false  (keep — no digit)
 *   "Chrome 142 release notes"   → false  (keep — no marker)
 */
const PRE_RELEASE_MARKERS =
  /(?:^|[\s.\-])(canary|dev|rc|beta|alpha|experimental|nightly|preview|snapshot)(?:$|[\s.\-0-9])/i;

export function isPreRelease(title: string): boolean {
  if (!title) return false;
  if (!/\d/.test(title)) return false;
  return PRE_RELEASE_MARKERS.test(title);
}

/**
 * Pulls a HN/Lobsters engagement score out of the raw description text.
 * hnrss.org includes "Points: N" lines, Lobsters embeds a numeric vote
 * count. Returns the higher of the two so a single helper handles both
 * without source-specific branches in the caller.
 */
function extractEngagement(rawText: string | null): number | null {
  if (!rawText) return null;
  let best: number | null = null;
  for (const re of [
    /Points:\s*(\d+)/i,
    /\bScore[:\s]+(\d+)/i,
    /\bUpvotes?:\s*(\d+)/i,
  ]) {
    const m = rawText.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n) && (best === null || n > best)) best = n;
    }
  }
  return best;
}

export function parseFeed(xml: string): ParsedItem[] {
  // Atom first — looks for <entry>; RSS uses <item>.
  const isAtom = /<feed[\s>]/i.test(xml) && /<entry[\s>]/i.test(xml);
  const blockTag = isAtom ? "entry" : "item";
  const blockRe = new RegExp(
    `<${blockTag}(?:\\s[^>]*)?>[\\s\\S]*?</${blockTag}>`,
    "gi",
  );
  const blocks = xml.match(blockRe) ?? [];

  const items: ParsedItem[] = [];
  for (const block of blocks) {
    const title = cleanTitle(pickTag(block, "title"));
    const url = isAtom ? pickAtomLink(block) : pickTag(block, "link");
    const dateRaw =
      pickTag(block, "updated") ??
      pickTag(block, "published") ??
      pickTag(block, "pubDate") ??
      pickTag(block, "dc:date");
    const summaryRaw =
      pickTag(block, "summary") ??
      pickTag(block, "description") ??
      pickTag(block, "content:encoded") ??
      pickTag(block, "content");

    const publishedAt = parseDate(dateRaw);
    if (!title || !url || !publishedAt) continue;

    items.push({
      url: url.trim(),
      title,
      excerpt: cleanText(summaryRaw),
      publishedAt,
      engagement: extractEngagement(summaryRaw),
    });
  }
  return items;
}

/**
 * Tiny OPML parser + emitter. OPML is the de-facto interchange format
 * for RSS reader subscriptions — every popular reader (Feedly, NetNews-
 * Wire, Inoreader, ...) imports and exports it, so supporting OPML lets
 * users migrate into devpulse in one click.
 *
 * Hand-rolled because the format we need is trivial (just <outline>
 * elements with text + xmlUrl), and pulling in a full XML parser is
 * overkill.
 */

import { Category } from "./sources";

export type OpmlEntry = {
  name: string;
  url: string;
  category: Category;
};

/** Default category for imported entries — most OPML files don't carry
 *  one, and we don't try to guess by feed content. User can re-categorize
 *  in /settings after import. */
const FALLBACK_CATEGORY: Category = "community";

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/**
 * Pull every outline that carries an xmlUrl. We ignore the OPML folder
 * hierarchy — most consumers flatten anyway, and devpulse has its own
 * category system in /settings.
 */
export function parseOpml(xml: string): OpmlEntry[] {
  const out: OpmlEntry[] = [];
  // Matches both self-closing and paired <outline ...> tags.
  const re = /<outline\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml))) {
    const attrs = match[1];
    const xmlUrl = pickAttr(attrs, "xmlUrl");
    if (!xmlUrl) continue;
    const title =
      pickAttr(attrs, "title") ||
      pickAttr(attrs, "text") ||
      hostnameOf(xmlUrl) ||
      xmlUrl;
    out.push({
      name: decodeXmlEntities(title).slice(0, 80),
      url: decodeXmlEntities(xmlUrl),
      category: FALLBACK_CATEGORY,
    });
  }
  return dedupeByUrl(out);
}

function pickAttr(attrs: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i");
  const m = attrs.match(re);
  return m ? m[1] : null;
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function dedupeByUrl(entries: OpmlEntry[]): OpmlEntry[] {
  const seen = new Set<string>();
  const out: OpmlEntry[] = [];
  for (const e of entries) {
    if (seen.has(e.url)) continue;
    seen.add(e.url);
    out.push(e);
  }
  return out;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export type OpmlOutline = {
  name: string;
  url: string;
  category?: string;
};

export function emitOpml(
  title: string,
  outlines: OpmlOutline[],
  generatedAt = new Date(),
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${escapeXml(title)}</title>
    <dateCreated>${generatedAt.toISOString()}</dateCreated>
  </head>
  <body>
${outlines
  .map(
    (o) =>
      `    <outline text="${escapeXml(o.name)}" type="rss" xmlUrl="${escapeXml(
        o.url,
      )}"${o.category ? ` category="${escapeXml(o.category)}"` : ""}/>`,
  )
  .join("\n")}
  </body>
</opml>
`;
}

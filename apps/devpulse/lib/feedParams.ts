export type FeedParams = {
  category?: string;
  source?: string;
  window?: string;
  q?: string;
  tag?: string;
  sort?: string;
};

export const SORT_MODES = [
  { key: "date", label: "Latest" },
  { key: "trending", label: "Trending" },
] as const;

export type SortMode = (typeof SORT_MODES)[number]["key"];
const VALID_SORTS = new Set(SORT_MODES.map((s) => s.key));

export const TIME_WINDOWS = [
  { key: "all", label: "All time", hours: 0 },
  { key: "24h", label: "Last 24h", hours: 24 },
  { key: "7d", label: "Last 7 days", hours: 24 * 7 },
  { key: "30d", label: "Last 30 days", hours: 24 * 30 },
] as const;

export type WindowKey = (typeof TIME_WINDOWS)[number]["key"];

const VALID_WINDOWS = new Set(TIME_WINDOWS.map((w) => w.key));

export function normalizeParams(raw: {
  [k: string]: string | string[] | undefined;
}): FeedParams {
  const pick = (k: string): string | undefined => {
    const v = raw[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const out: FeedParams = {};
  const cat = pick("category");
  if (cat) out.category = cat;
  const src = pick("source");
  if (src) out.source = src;
  const win = pick("window");
  if (win && VALID_WINDOWS.has(win as WindowKey) && win !== "all")
    out.window = win;
  const q = pick("q")?.trim().slice(0, 100);
  if (q) out.q = q;
  const tag = pick("tag")?.trim().slice(0, 40);
  if (tag) out.tag = tag;
  const sort = pick("sort");
  if (sort && VALID_SORTS.has(sort as SortMode) && sort !== "date") {
    out.sort = sort;
  }
  return out;
}

/**
 * Build a query-string href, preserving the params currently in `base` and
 * overlaying `override`. Passing `{ key: undefined }` removes the key.
 * `category=all` is treated as "no filter" and dropped — keeps the URL clean
 * when the user clicks the "All" tab.
 */
export function buildHref(
  base: FeedParams,
  override: Partial<FeedParams>,
): string {
  const merged: Record<string, string | undefined> = { ...base, ...override };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (!v) continue;
    if (k === "category" && v === "all") continue;
    if (k === "window" && v === "all") continue;
    if (k === "sort" && v === "date") continue;
    sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}

export function isFiltered(p: FeedParams): boolean {
  return Boolean(p.category || p.source || p.window || p.q || p.tag || p.sort);
}

export function windowCutoff(key: string | undefined): Date | null {
  const w = TIME_WINDOWS.find((x) => x.key === key);
  if (!w || w.hours === 0) return null;
  const d = new Date();
  d.setHours(d.getHours() - w.hours);
  return d;
}

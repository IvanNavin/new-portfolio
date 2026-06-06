import { notFound } from "next/navigation";

import { prisma } from "@lib/prisma";
import { getAllSources } from "@lib/sourcesDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

type SearchParams = Promise<{ token?: string }>;

/**
 * Source-health dashboard. Gated by `?token=` matching CRON_SECRET so a
 * leaked URL can't expose feed internals. The token is the same secret
 * that protects the cron route — one knob, one rotation.
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;
  const secret = process.env.CRON_SECRET;
  if (!secret || token !== secret) return notFound();

  const now = Date.now();
  const day = new Date(now - DAY_MS);
  const week = new Date(now - 7 * DAY_MS);

  const sources = await getAllSources();

  // One groupBy per window. Cheap because the table is small.
  const [latestPerSource, last24h, last7d] = await Promise.all([
    // Per-source most-recent publishedAt — used to spot stale feeds.
    prisma.newsItem.groupBy({
      by: ["source"],
      _max: { publishedAt: true },
      _count: { _all: true },
    }),
    prisma.newsItem.groupBy({
      by: ["source"],
      where: { publishedAt: { gte: day } },
      _count: { _all: true },
    }),
    prisma.newsItem.groupBy({
      by: ["source"],
      where: { publishedAt: { gte: week } },
      _count: { _all: true },
    }),
  ]);

  const latestMap = new Map(
    latestPerSource.map((r) => [
      r.source,
      { last: r._max.publishedAt, total: r._count._all },
    ]),
  );
  const day24Map = new Map(last24h.map((r) => [r.source, r._count._all]));
  const day7Map = new Map(last7d.map((r) => [r.source, r._count._all]));

  type Row = {
    name: string;
    weight: number;
    category: string;
    total: number;
    last24h: number;
    last7d: number;
    last: Date | null;
    flag: "ok" | "quiet" | "stale" | "silent";
  };

  const rows: Row[] = sources.map((s) => {
    const latest = latestMap.get(s.name);
    const last = latest?.last ?? null;
    const total = latest?.total ?? 0;
    const last24h = day24Map.get(s.name) ?? 0;
    const last7d = day7Map.get(s.name) ?? 0;
    let flag: Row["flag"] = "ok";
    if (total === 0) flag = "silent";
    else if (last && Date.now() - last.getTime() > 30 * DAY_MS) flag = "stale";
    else if (last7d === 0) flag = "quiet";
    return {
      name: s.name,
      weight: s.weight,
      category: s.category,
      total,
      last24h,
      last7d,
      last,
      flag,
    };
  });

  // Sort: silent / stale first, then quiet, then by weight desc.
  const flagOrder: Record<Row["flag"], number> = {
    silent: 0,
    stale: 1,
    quiet: 2,
    ok: 3,
  };
  rows.sort((a, b) => {
    if (flagOrder[a.flag] !== flagOrder[b.flag])
      return flagOrder[a.flag] - flagOrder[b.flag];
    return b.weight - a.weight;
  });

  const counts = {
    silent: rows.filter((r) => r.flag === "silent").length,
    stale: rows.filter((r) => r.flag === "stale").length,
    quiet: rows.filter((r) => r.flag === "quiet").length,
    ok: rows.filter((r) => r.flag === "ok").length,
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">
          Source health
        </h1>
        <p className="text-sm text-[var(--text-dim)]">
          {sources.length} sources · {counts.ok} ok · {counts.quiet} quiet ·{" "}
          {counts.stale} stale · {counts.silent} silent
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-elev)] text-left text-xs tracking-wide text-[var(--text-dim)] uppercase">
            <tr>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Weight</th>
              <th className="px-4 py-3 text-right">24h</th>
              <th className="px-4 py-3 text-right">7d</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Last</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-[var(--border)]">
                <td className="px-4 py-2.5 font-medium">{r.name}</td>
                <td className="px-4 py-2.5 text-[var(--text-dim)]">
                  {r.category}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {r.weight}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {r.last24h}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {r.last7d}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {r.total}
                </td>
                <td className="px-4 py-2.5 text-[var(--text-dim)]">
                  {r.last ? r.last.toISOString().slice(0, 10) : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <FlagBadge flag={r.flag} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-8 text-xs text-[var(--text-dim)]">
        <ul className="flex flex-wrap gap-4">
          <li>
            <b className="text-emerald-300">ok</b> — items in last 7d
          </li>
          <li>
            <b className="text-amber-300">quiet</b> — 0 items in 7d, but
            historical
          </li>
          <li>
            <b className="text-orange-300">stale</b> — last item &gt;30d old
          </li>
          <li>
            <b className="text-red-300">silent</b> — never produced anything
            (check URL)
          </li>
        </ul>
      </footer>
    </main>
  );
}

function FlagBadge({ flag }: { flag: "ok" | "quiet" | "stale" | "silent" }) {
  const styles: Record<typeof flag, string> = {
    ok: "bg-emerald-400/15 text-emerald-300",
    quiet: "bg-amber-400/15 text-amber-200",
    stale: "bg-orange-400/15 text-orange-200",
    silent: "bg-red-400/15 text-red-300",
  };
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs ${styles[flag]}`}
    >
      {flag}
    </span>
  );
}

import { Category, CATEGORY_LABELS } from "@lib/sources";

import { CardActions } from "./CardActions";
import { NewBadge } from "./NewBadge";
import { PrettyTime } from "./PrettyTime";
import { TagChip } from "./TagChip";
import { Tooltip } from "./Tooltip";

type Item = {
  id: string;
  url: string;
  title: string;
  excerpt: string | null;
  source: string;
  category: string;
  publishedAt: Date;
  /** Optional score metadata — when present, the card gets visual emphasis. */
  boosted?: boolean;
  matches?: string[];
  /** Pre-computed tags (curated keyword matches at ingest). Rendered as
   *  clickable Links to ?tag=label. */
  tags?: string[];
  /** HN points / Lobsters score when the feed provides one. */
  engagement?: number | null;
};

function safeHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function NewsCard({ item }: { item: Item }) {
  const categoryLabel =
    CATEGORY_LABELS[item.category as Category] ?? item.category;
  const isoDate = item.publishedAt.toISOString();
  const hostname = safeHostname(item.url);
  const tagLabels = (item.matches ?? []).slice(0, 3);
  const hasEngagement =
    typeof item.engagement === "number" && item.engagement > 0;
  const hasFooter = tagLabels.length > 0 || hasEngagement;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      data-card-url={item.url}
      className={[
        "group relative block rounded-xl border bg-[var(--bg-elev)]/60 p-5 pr-44 transition-all",
        "focus:ring-2 focus:ring-sky-400/40 focus:outline-none",
        item.boosted
          ? "border-sky-400/40 bg-sky-400/[0.04] hover:border-sky-300/70 hover:bg-sky-400/10"
          : "border-[var(--border)] hover:border-sky-400/40 hover:bg-[var(--bg-elev)]",
      ].join(" ")}
    >
      <CardActions url={item.url} title={item.title} />
      {/* First meta row stays slim — source / category / NEW / time —
          so wrapping never strands the time on its own line. Tags and
          engagement live in the footer below the excerpt. */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-0.5 text-[var(--text-dim)]">
          {hostname && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://icons.duckduckgo.com/ip3/${encodeURIComponent(hostname)}.ico`}
              alt=""
              width={14}
              height={14}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-[14px] w-[14px] shrink-0 rounded-[3px]"
            />
          )}
          {item.source}
        </span>
        <span className="text-[var(--text-dim)]">·</span>
        <span className="text-[var(--text-dim)]">{categoryLabel}</span>
        <NewBadge publishedAtIso={isoDate} />
        <span className="ml-auto">
          <PrettyTime iso={isoDate} />
        </span>
      </div>
      <h2 className="mb-2 text-lg leading-snug font-medium text-[var(--text)] group-hover:text-sky-200">
        {item.title}
      </h2>
      {item.excerpt && (
        <p className="line-clamp-3 text-sm text-[var(--text-dim)]">
          {item.excerpt}
        </p>
      )}
      {hasFooter && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {tagLabels.map((label) => (
            <TagChip key={label} label={label} />
          ))}
          {hasEngagement && (
            <Tooltip
              label={`${item.engagement} points on ${item.source} — used by the Trending sort`}
            >
              <span
                className="rounded-md bg-orange-400/15 px-2 py-0.5 text-[10px] tracking-wide text-orange-200"
                aria-label={`${item.engagement} engagement points on ${item.source}`}
              >
                <span aria-hidden="true">▲ {item.engagement}</span>
              </span>
            </Tooltip>
          )}
        </div>
      )}
    </a>
  );
}

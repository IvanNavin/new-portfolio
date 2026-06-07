"use client";

import { Category, CATEGORY_LABELS } from "@lib/sources";
import { useState } from "react";

import { CardActions } from "./CardActions";
import { NewBadge } from "./NewBadge";
import { PrettyTime } from "./PrettyTime";
import { ReaderDrawer } from "./ReaderDrawer";
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
  tags?: string[];
  engagement?: number | null;
  summary?: string | null;
  /** Other source feeds that pointed at the same URL. UI shows them
   *  as a "+ HN, +Lobsters" cluster pill in the meta row. */
  referrers?: string[];
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
  const cluster = (item.referrers ?? []).filter((r) => r !== item.source);

  const [readerOpen, setReaderOpen] = useState(false);
  const openReader = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReaderOpen(true);
  };

  return (
    <>
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer noopener"
        data-card-url={item.url}
        className={[
          "group relative block rounded-xl border bg-[var(--bg-elev)]/60 p-5 pr-14 transition-all sm:pr-36",
          "focus:ring-2 focus:ring-sky-400/40 focus:outline-none",
          item.boosted
            ? "border-sky-400/40 bg-sky-400/[0.04] hover:border-sky-300/70 hover:bg-sky-400/10"
            : "border-[var(--border)] hover:border-sky-400/40 hover:bg-[var(--bg-elev)]",
        ].join(" ")}
      >
        <CardActions
          url={item.url}
          title={item.title}
          onOpenReader={openReader}
        />
        <div className="mb-3 flex flex-col items-start gap-1 text-[11px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1 sm:text-xs">
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-white/5 px-1.5 py-0.5 text-[var(--text-dim)] sm:px-2">
            {hostname && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/favicon?host=${encodeURIComponent(hostname)}`}
                alt=""
                width={14}
                height={14}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-[14px] w-[14px] shrink-0 rounded-[3px]"
              />
            )}
            <span className="truncate">{item.source}</span>
          </span>
          {cluster.length > 0 && (
            <Tooltip
              label={`Also shared by ${cluster.join(", ")}`}
              side="bottom"
            >
              <span className="rounded-md bg-[var(--c-accent-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--c-accent-fg)]">
                +{cluster.length}
              </span>
            </Tooltip>
          )}
          <span className="hidden text-[var(--text-dim)] sm:inline">·</span>
          <span className="text-[var(--text-dim)]">{categoryLabel}</span>
          <NewBadge publishedAtIso={isoDate} />
          <span className="whitespace-nowrap sm:ml-auto">
            <PrettyTime iso={isoDate} />
          </span>
        </div>
        <h2 className="mb-2 text-lg leading-snug font-medium text-[var(--text)] group-hover:text-sky-200">
          {item.title}
        </h2>
        {item.summary ? (
          <div className="space-y-2">
            <p className="text-sm leading-snug text-[var(--text)]">
              <span
                aria-hidden="true"
                className="mr-1.5 inline-block rounded bg-[var(--c-accent-soft)] px-1 py-0.5 text-[9px] font-semibold tracking-wide text-[var(--c-accent-fg)] uppercase"
              >
                TLDR
              </span>
              {item.summary}
            </p>
            {item.excerpt && (
              <p className="line-clamp-2 text-xs text-[var(--text-dim)]">
                {item.excerpt}
              </p>
            )}
          </div>
        ) : (
          item.excerpt && (
            <p className="line-clamp-3 text-sm text-[var(--text-dim)]">
              {item.excerpt}
            </p>
          )
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
                  className="rounded-md bg-[var(--c-engage-soft)] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[var(--c-engage-fg)]"
                  aria-label={`${item.engagement} engagement points on ${item.source}`}
                >
                  <span aria-hidden="true">▲ {item.engagement}</span>
                </span>
              </Tooltip>
            )}
          </div>
        )}
      </a>
      {readerOpen && (
        <ReaderDrawer
          itemId={item.id}
          itemUrl={item.url}
          itemTitle={item.title}
          onClose={() => setReaderOpen(false)}
        />
      )}
    </>
  );
}

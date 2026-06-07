import { Category, CATEGORY_LABELS } from "@lib/sources";

import { CardActions } from "./CardActions";
import { NewBadge } from "./NewBadge";
import { timeAgo } from "./timeAgo";

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
};

export function NewsCard({ item }: { item: Item }) {
  const categoryLabel =
    CATEGORY_LABELS[item.category as Category] ?? item.category;
  const isoDate = item.publishedAt.toISOString();
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      data-card-url={item.url}
      className={[
        "group relative block rounded-xl border bg-[var(--bg-elev)]/60 p-5 pr-20 transition-all",
        "focus:ring-2 focus:ring-sky-400/40 focus:outline-none",
        item.boosted
          ? "border-sky-400/40 bg-sky-400/[0.04] hover:border-sky-300/70 hover:bg-sky-400/10"
          : "border-[var(--border)] hover:border-sky-400/40 hover:bg-[var(--bg-elev)]",
      ].join(" ")}
    >
      <CardActions url={item.url} />
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md bg-white/5 px-2 py-0.5 text-[var(--text-dim)]">
          {item.source}
        </span>
        <span className="text-[var(--text-dim)]">·</span>
        <span className="text-[var(--text-dim)]">{categoryLabel}</span>
        <NewBadge publishedAtIso={isoDate} />
        {item.matches?.slice(0, 3).map((label) => (
          <span
            key={label}
            className="rounded-md bg-sky-400/15 px-2 py-0.5 text-[10px] tracking-wide text-sky-200 uppercase"
          >
            ★ {label}
          </span>
        ))}
        <time
          dateTime={isoDate}
          title={isoDate}
          className="ml-auto text-[var(--text-dim)]"
        >
          {timeAgo(item.publishedAt)}
        </time>
      </div>
      <h2 className="mb-2 text-lg leading-snug font-medium text-[var(--text)] group-hover:text-sky-200">
        {item.title}
      </h2>
      {item.excerpt && (
        <p className="line-clamp-3 text-sm text-[var(--text-dim)]">
          {item.excerpt}
        </p>
      )}
    </a>
  );
}

import {
  buildHref,
  FeedParams,
  isFiltered,
  SORT_MODES,
  TIME_WINDOWS,
} from "@lib/feedParams";
import { getSourceFilterList } from "@lib/sourcesDb";
import Link from "next/link";

type Props = {
  params: FeedParams;
};

export async function FiltersBar({ params }: Props) {
  const activeWindow = params.window ?? "all";
  const activeSort = params.sort ?? "date";
  const sources = await getSourceFilterList();

  return (
    <div className="flex flex-col gap-3">
      {/* Search + source select live in a native GET form so the URL stays
          shareable and the page works without JS. Hidden inputs preserve the
          currently-active category / window so we don't blow them away on
          submit. */}
      <form
        action="/"
        method="get"
        className="flex flex-wrap items-center gap-2"
      >
        {params.category && (
          <input type="hidden" name="category" value={params.category} />
        )}
        {params.window && (
          <input type="hidden" name="window" value={params.window} />
        )}
        <input
          type="search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search titles & excerpts…"
          aria-label="Search titles and excerpts"
          className="flex-1 min-w-[200px] rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-3 py-2 text-sm placeholder:text-[var(--text-dim)] focus-visible:border-sky-400/60 focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:outline-none"
        />
        <select
          name="source"
          defaultValue={params.source ?? ""}
          aria-label="Filter by source"
          className="rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-3 py-2 text-sm focus-visible:border-sky-400/60 focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:outline-none"
        >
          <option value="">All sources</option>
          {sources.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-[var(--c-accent-fg)] bg-[var(--c-accent-soft)] px-3 py-2 text-sm font-medium text-[var(--c-accent-fg)] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none"
        >
          Apply
        </button>
        {isFiltered(params) && (
          <Link
            href="/"
            prefetch={false}
            className="text-sm text-[var(--text-dim)] hover:text-[var(--text)] underline underline-offset-4 focus-visible:rounded focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none"
          >
            Clear all
          </Link>
        )}
      </form>

      <nav
        className="flex flex-wrap items-center gap-2"
        aria-label="Time window and sort"
      >
        {TIME_WINDOWS.map((w) => {
          const isActive = activeWindow === w.key;
          const href = buildHref(params, { window: w.key });
          return (
            <Link
              key={w.key}
              href={href}
              prefetch={false}
              aria-current={isActive ? "page" : undefined}
              className={[
                "inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors",
                "focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:outline-none",
                isActive
                  ? "border-[var(--c-good-fg)] bg-[var(--c-good-soft)] text-[var(--c-good-fg)] font-medium"
                  : "border-[var(--border)] text-[var(--text-dim)] hover:border-emerald-400/40 hover:text-[var(--text)]",
              ].join(" ")}
            >
              {w.label}
            </Link>
          );
        })}
        <span
          className="mx-1 hidden h-4 w-px bg-[var(--border)] sm:inline-block"
          aria-hidden="true"
        />
        {SORT_MODES.map((s) => {
          const isActive = activeSort === s.key;
          const href = buildHref(params, { sort: s.key });
          return (
            <Link
              key={s.key}
              href={href}
              prefetch={false}
              aria-current={isActive ? "page" : undefined}
              className={[
                "inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors",
                "focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:outline-none",
                isActive
                  ? "border-[var(--c-engage-fg)] bg-[var(--c-engage-soft)] text-[var(--c-engage-fg)] font-medium"
                  : "border-[var(--border)] text-[var(--text-dim)] hover:border-orange-400/40 hover:text-[var(--text)]",
              ].join(" ")}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

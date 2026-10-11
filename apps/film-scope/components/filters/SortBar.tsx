"use client";

import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { useTranslations } from "next-intl";

import { useFilters } from "@/components/filters/useFilters";
import { cn } from "@/lib/cn";
import {
  PAGE_SIZES,
  type PageSize,
  SORT_FIELDS,
  type SortField,
} from "@/lib/filters/schema";

/**
 * Deliberately not `inputClass`: that one is `w-full` for the sidebar, and this
 * bar needs controls that only take the width of their longest option.
 */
const selectClass =
  "rounded-lg border border-edge bg-surface-raised px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent/60";

export const SortBar = ({
  totalResults,
  approximate,
  scanned,
}: {
  totalResults: number;
  approximate: boolean;
  scanned: number;
}) => {
  const t = useTranslations();
  const { query, patch, patchSection, pending } = useFilters();

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-sm text-ink-dim" aria-live="polite">
          {pending
            ? t("results.loading")
            : t("results.count", { count: totalResults })}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-1.5">
            <label
              className="whitespace-nowrap text-xs uppercase tracking-wide text-ink-faint"
              htmlFor="per-page"
            >
              {t("results.perPage")}
            </label>
            <select
              id="per-page"
              value={query.perPage}
              onChange={(event) =>
                // Changing page size shifts what "page 3" means, so go back to
                // the first page rather than landing somewhere arbitrary.
                patch({
                  perPage: Number(event.target.value) as PageSize,
                  page: 1,
                })
              }
              className={selectClass}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </span>

          <span className="flex items-center gap-1.5">
            <label
              className="whitespace-nowrap text-xs uppercase tracking-wide text-ink-faint"
              htmlFor="sort-by"
            >
              {t("sort.label")}
            </label>
            <select
              id="sort-by"
              value={query.sort.by}
              onChange={(event) =>
                patchSection("sort", { by: event.target.value as SortField })
              }
              className={cn(selectClass, "max-w-[12rem]")}
            >
              {SORT_FIELDS.map((field) => (
                <option key={field} value={field}>
                  {t(`sort.${field}`)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                patchSection("sort", {
                  dir: query.sort.dir === "desc" ? "asc" : "desc",
                })
              }
              aria-label={t(
                query.sort.dir === "desc" ? "sort.desc" : "sort.asc",
              )}
              title={t(query.sort.dir === "desc" ? "sort.desc" : "sort.asc")}
              className="shrink-0 rounded-lg border border-edge bg-surface-raised p-2 text-ink-dim transition-colors hover:border-edge-strong hover:text-ink"
            >
              {query.sort.dir === "desc" ? (
                <ArrowDownWideNarrow size={16} />
              ) : (
                <ArrowUpNarrowWide size={16} />
              )}
            </button>
          </span>
        </div>
      </div>

      {approximate ? (
        <p className="text-[11px] leading-snug text-ink-faint">
          {t("results.approximate", { scanned })}
        </p>
      ) : null}
    </div>
  );
};

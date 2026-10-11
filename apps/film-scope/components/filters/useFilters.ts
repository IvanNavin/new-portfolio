"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

import {
  DEFAULT_FILTERS,
  type FilterQuery,
  parseFilterQuery,
  serializeFilterQuery,
} from "@/lib/filters/schema";
import { usePathname, useRouter } from "@/lib/i18n/navigation";

/**
 * The URL is the single source of truth for every filter. That makes any search
 * shareable and bookmarkable, survives a refresh, and keeps the server
 * component the only place that fetches.
 */
export const useFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const query = useMemo(
    () => parseFilterQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const commit = useCallback(
    (next: FilterQuery) => {
      const serialized = serializeFilterQuery(next).toString();
      startTransition(() => {
        router.push(serialized ? `${pathname}?${serialized}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router],
  );

  /** Any change other than paging sends the user back to page 1. */
  const patch = useCallback(
    (partial: Partial<FilterQuery>) => {
      const resetPage = !("page" in partial);
      commit({ ...query, ...partial, ...(resetPage ? { page: 1 } : {}) });
    },
    [commit, query],
  );

  const patchSection = useCallback(
    <K extends keyof FilterQuery>(key: K, partial: Partial<FilterQuery[K]>) => {
      patch({
        [key]: { ...(query[key] as object), ...partial },
      } as Partial<FilterQuery>);
    },
    [patch, query],
  );

  const replace = useCallback((next: FilterQuery) => commit(next), [commit]);
  const reset = useCallback(() => commit(DEFAULT_FILTERS), [commit]);

  return { query, patch, patchSection, replace, reset, pending };
};

/** Tri-state membership used by every include/exclude control. */
export type Tri = "off" | "include" | "exclude";

export const triOf = <T>(
  value: T,
  include: readonly T[],
  exclude: readonly T[],
): Tri => {
  if (include.includes(value)) return "include";
  if (exclude.includes(value)) return "exclude";
  return "off";
};

/** off -> include -> exclude -> off */
export const cycleTri = <T>(
  value: T,
  include: readonly T[],
  exclude: readonly T[],
): { include: T[]; exclude: T[] } => {
  const state = triOf(value, include, exclude);
  const withoutValue = {
    include: include.filter((item) => item !== value),
    exclude: exclude.filter((item) => item !== value),
  };

  if (state === "off")
    return {
      include: [...withoutValue.include, value],
      exclude: withoutValue.exclude,
    };
  if (state === "include")
    return {
      include: withoutValue.include,
      exclude: [...withoutValue.exclude, value],
    };
  return withoutValue;
};

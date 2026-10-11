"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { useFilters } from "@/components/filters/useFilters";
import { Chip } from "@/components/ui/Chip";
import { REGION_GROUPS } from "@/lib/filters/regions";
import {
  type Band,
  CERT_LADDER,
  DEFAULT_FILTERS,
  type FilterQuery,
  type SetFacet,
  TV_STATUS,
  TV_TYPES,
} from "@/lib/filters/schema";
import type { FilterConfig } from "@/lib/tmdb/config";
import type { FacetKind, FacetOption } from "@/lib/tmdb/search";

type Entry = {
  key: string;
  label: string;
  tone: "include" | "exclude" | "neutral";
  onRemove: () => void;
};

/** Async facets carry ids in the URL; names are fetched once per kind. */
const useResolvedNames = (query: FilterQuery, locale: string) => {
  const [names, setNames] = useState<Record<number, string>>({});

  const wanted = useMemo(() => {
    const byKind: Record<FacetKind, number[]> = {
      person: [],
      keyword: [],
      company: [],
    };
    byKind.person = [
      ...query.cast.include,
      ...query.cast.exclude,
      ...query.crew.include,
      ...query.crew.exclude,
    ];
    byKind.keyword = [...query.keywords.include, ...query.keywords.exclude];
    byKind.company = [...query.companies.include, ...query.companies.exclude];
    return byKind;
  }, [query.cast, query.crew, query.keywords, query.companies]);

  const signature = JSON.stringify(wanted);

  useEffect(() => {
    const byKind: Record<FacetKind, number[]> = JSON.parse(signature);
    const controller = new AbortController();

    for (const kind of Object.keys(byKind) as FacetKind[]) {
      const ids = byKind[kind];
      if (!ids.length) continue;

      fetch(`/api/search?kind=${kind}&locale=${locale}&ids=${ids.join(",")}`, {
        signal: controller.signal,
      })
        .then(
          (response) => response.json() as Promise<{ results: FacetOption[] }>,
        )
        .then((data) =>
          setNames((current) => {
            const next = { ...current };
            for (const entry of data.results) next[entry.id] = entry.name;
            return next;
          }),
        )
        .catch(() => {
          // Offline or aborted — chips fall back to "#id", still removable.
        });
    }

    return () => controller.abort();
  }, [signature, locale]);

  return names;
};

/**
 * The showcase: every constraint currently narrowing the results, in one row,
 * each one removable.
 *
 * Without it the only way to know what is on is to scroll a sidebar with six
 * collapsible sections — and on a phone the sidebar is closed entirely. A
 * filter you cannot see is a filter you cannot undo.
 */
export const ActiveFilters = ({
  config,
  locale,
}: {
  config: FilterConfig;
  locale: string;
}) => {
  const t = useTranslations("active");
  const tf = useTranslations("filters");
  const { query, patch, patchSection, reset } = useFilters();
  const names = useResolvedNames(query, locale);

  const genreName = (id: number) =>
    [...config.movieGenres, ...config.tvGenres].find((genre) => genre.id === id)
      ?.name ?? `#${id}`;
  const countryName = (code: string) =>
    config.countries.find((entry) => entry.value === code)?.label ?? code;
  const languageName = (code: string) =>
    config.languages.find((entry) => entry.value === code)?.label ?? code;
  const providerName = (id: number) =>
    config.providers.find((entry) => entry.id === id)?.name ?? `#${id}`;

  const entries: Entry[] = [];

  const dropFrom = <T,>(facet: SetFacet<T>, value: T): SetFacet<T> => ({
    include: facet.include.filter((item) => item !== value),
    exclude: facet.exclude.filter((item) => item !== value),
    mode: facet.mode,
  });

  /** Renders one set facet, collapsing fully-applied region groups into a single chip. */
  const pushSet = <T,>(
    field: keyof FilterQuery,
    facet: SetFacet<T>,
    title: string,
    nameOf: (value: T) => string,
    collapse?: { label: string; members: T[] }[],
  ) => {
    // Values already covered by a collapsed group chip, so they are not also
    // listed one by one. Never reassigns anything derived from the query.
    const consumed = new Set<T>();

    const withoutGroup = (members: T[]): SetFacet<T> => ({
      include: facet.include.filter((item) => !members.includes(item)),
      exclude: facet.exclude.filter((item) => !members.includes(item)),
      mode: facet.mode,
    });

    for (const group of collapse ?? []) {
      if (!group.members.length) continue;

      for (const bucket of ["include", "exclude"] as const) {
        const list = facet[bucket];
        if (!group.members.every((item) => list.includes(item))) continue;
        if (group.members.some((item) => consumed.has(item))) continue;

        for (const item of group.members) consumed.add(item);
        entries.push({
          key: `${String(field)}-${bucket}-${group.label}`,
          label: `${title}: ${
            bucket === "exclude"
              ? t("notFrom", { value: group.label })
              : group.label
          }`,
          tone: bucket,
          onRemove: () =>
            patch({
              [field]: withoutGroup(group.members),
            } as Partial<FilterQuery>),
        });
      }
    }

    for (const value of facet.include) {
      if (consumed.has(value)) continue;
      entries.push({
        key: `${String(field)}-in-${String(value)}`,
        label: `${title}: ${nameOf(value)}`,
        tone: "include",
        onRemove: () =>
          patch({ [field]: dropFrom(facet, value) } as Partial<FilterQuery>),
      });
    }
    for (const value of facet.exclude) {
      if (consumed.has(value)) continue;
      entries.push({
        key: `${String(field)}-ex-${String(value)}`,
        label: `${title}: ${t("notFrom", { value: nameOf(value) })}`,
        tone: "exclude",
        onRemove: () =>
          patch({ [field]: dropFrom(facet, value) } as Partial<FilterQuery>),
      });
    }
  };

  const rangeLabel = (range: { min?: number; max?: number }): string | null => {
    if (range.min !== undefined && range.min === range.max)
      return String(range.min);
    if (range.min !== undefined && range.max !== undefined) {
      return t("range", { from: range.min, to: range.max });
    }
    if (range.min !== undefined) return t("min", { value: range.min });
    if (range.max !== undefined) return t("max", { value: range.max });
    return null;
  };

  const pushRange = (field: "year" | "runtime", title: string) => {
    const range = query[field];
    const label = rangeLabel(range);
    if (label) {
      entries.push({
        key: `${field}-range`,
        label: `${title}: ${label}`,
        tone: "include",
        onRemove: () =>
          patch({
            [field]: { exclude: range.exclude },
          } as Partial<FilterQuery>),
      });
    }
    range.exclude.forEach((band: Band, index: number) => {
      const bandLabel = rangeLabel(band);
      if (!bandLabel) return;
      entries.push({
        key: `${field}-band-${index}`,
        label: `${title}: ${t("notFrom", { value: bandLabel })}`,
        tone: "exclude",
        onRemove: () =>
          patch({
            [field]: {
              ...range,
              exclude: range.exclude.filter(
                (_, position) => position !== index,
              ),
            },
          } as Partial<FilterQuery>),
      });
    });
  };

  if (query.type !== DEFAULT_FILTERS.type) {
    entries.push({
      key: "type",
      label: `${t("type")}: ${tf(`type.${query.type}`)}`,
      tone: "neutral",
      onRemove: () => patch({ type: DEFAULT_FILTERS.type }),
    });
  }

  if (query.animation !== DEFAULT_FILTERS.animation) {
    entries.push({
      key: "animation",
      label: `${t("animation")}: ${tf(`animation.${query.animation}`)}`,
      tone: query.animation === "without" ? "exclude" : "include",
      onRemove: () => patch({ animation: DEFAULT_FILTERS.animation }),
    });
  }

  pushSet("genres", query.genres, t("genres"), genreName);
  pushSet(
    "countries",
    query.countries,
    t("countries"),
    countryName,
    REGION_GROUPS.map((group) => ({
      label: tf(`regions.${group.id}`),
      members: group.countries,
    })),
  );
  pushSet("languages", query.languages, t("languages"), languageName);
  pushSet("cast", query.cast, t("cast"), (id: number) => names[id] ?? `#${id}`);
  pushSet("crew", query.crew, t("crew"), (id: number) => names[id] ?? `#${id}`);
  pushSet(
    "companies",
    query.companies,
    t("companies"),
    (id: number) => names[id] ?? `#${id}`,
  );
  pushSet(
    "keywords",
    query.keywords,
    t("keywords"),
    (id: number) => names[id] ?? `#${id}`,
  );

  for (const id of query.providers.include) {
    entries.push({
      key: `provider-in-${id}`,
      label: `${t("providers")}: ${providerName(id)}`,
      tone: "include",
      onRemove: () =>
        patchSection("providers", {
          include: query.providers.include.filter((item) => item !== id),
        }),
    });
  }
  for (const id of query.providers.exclude) {
    entries.push({
      key: `provider-ex-${id}`,
      label: `${t("providers")}: ${t("notFrom", { value: providerName(id) })}`,
      tone: "exclude",
      onRemove: () =>
        patchSection("providers", {
          exclude: query.providers.exclude.filter((item) => item !== id),
        }),
    });
  }
  for (const type of query.providers.monetization) {
    entries.push({
      key: `monetization-${type}`,
      label: `${t("monetization")}: ${tf(`monetization.${type}`)}`,
      tone: "include",
      onRemove: () =>
        patchSection("providers", {
          monetization: query.providers.monetization.filter(
            (item) => item !== type,
          ),
        }),
    });
  }

  if (query.certification.min || query.certification.max) {
    const label =
      query.certification.min === query.certification.max
        ? query.certification.min
        : t("range", {
            from: query.certification.min ?? CERT_LADDER[0],
            to: query.certification.max ?? CERT_LADDER[CERT_LADDER.length - 1],
          });
    entries.push({
      key: "certification",
      label: `${t("certification")}: ${label}`,
      tone: "include",
      onRemove: () =>
        patchSection("certification", { min: undefined, max: undefined }),
    });
  }

  for (const value of query.tvStatus) {
    const entry = TV_STATUS.find((item) => item.value === value);
    entries.push({
      key: `tvStatus-${value}`,
      label: `${t("tvStatus")}: ${entry ? tf(`tvStatus.${entry.key}`) : value}`,
      tone: "include",
      onRemove: () =>
        patch({ tvStatus: query.tvStatus.filter((item) => item !== value) }),
    });
  }
  for (const value of query.tvTypes) {
    const entry = TV_TYPES.find((item) => item.value === value);
    entries.push({
      key: `tvTypes-${value}`,
      label: `${t("tvTypes")}: ${entry ? tf(`tvTypes.${entry.key}`) : value}`,
      tone: "include",
      onRemove: () =>
        patch({ tvTypes: query.tvTypes.filter((item) => item !== value) }),
    });
  }

  pushRange("year", t("year"));
  pushRange("runtime", t("runtime"));

  const scoreLabel = rangeLabel(query.rating.value);
  if (scoreLabel) {
    entries.push({
      key: "score",
      label: `${t("score")}: ${scoreLabel}`,
      tone: "include",
      onRemove: () => patchSection("rating", { value: { exclude: [] } }),
    });
  }

  const votes = query.rating.votes;
  if (
    votes.min !== DEFAULT_FILTERS.rating.votes.min ||
    votes.max !== undefined
  ) {
    const label = rangeLabel(votes);
    if (label) {
      entries.push({
        key: "votes",
        label: `${t("votes")}: ${label}`,
        tone: "neutral",
        onRemove: () =>
          patchSection("rating", {
            votes: { min: DEFAULT_FILTERS.rating.votes.min, exclude: [] },
          }),
      });
    }
  }

  if (!entries.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-edge bg-surface-raised/60 px-3 py-2.5">
      <span className="mr-1 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        {t("heading")}
      </span>
      {entries.map((entry) => (
        <Chip
          key={entry.key}
          tone={entry.tone === "neutral" ? "accent" : entry.tone}
          onRemove={entry.onRemove}
        >
          {entry.label}
        </Chip>
      ))}
      <button
        type="button"
        onClick={reset}
        className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-ink-faint transition-colors hover:text-danger"
      >
        <RotateCcw size={12} />
        {t("clear")}
      </button>
    </div>
  );
};

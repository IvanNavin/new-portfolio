"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

import { AnimationToggle } from "@/components/filters/AnimationToggle";
import { FilterSection } from "@/components/filters/FilterSection";
import { RegionGroups } from "@/components/filters/RegionGroups";
import { useFilters } from "@/components/filters/useFilters";
import { AsyncFacetSelect } from "@/components/ui/AsyncFacetSelect";
import { Chip } from "@/components/ui/Chip";
import { ChipFacet } from "@/components/ui/ChipFacet";
import { type FacetLabels, FacetSelect } from "@/components/ui/FacetSelect";
import { Field, inputClass } from "@/components/ui/Field";
import { RangeField, type RangeLabels } from "@/components/ui/RangeField";
import { Segmented } from "@/components/ui/Segmented";
import { YearField, type YearLabels } from "@/components/ui/YearField";
import {
  CERT_LADDER,
  DEFAULT_FILTERS,
  hasActiveFilters,
  type Monetization,
  MONETIZATION_TYPES,
  type RatingSource,
  type SetFacet,
  type TitleType,
  TV_STATUS,
  TV_TYPES,
} from "@/lib/filters/schema";
import type { FilterConfig } from "@/lib/tmdb/config";
import { MOVIE_GENRES, retargetGenres, TV_GENRES } from "@/lib/tmdb/genres";

type FilterPanelProps = {
  config: FilterConfig;
  locale: string;
  /** Stage 1 has no IMDb index yet; the option is shown but flagged. */
  imdbAvailable: boolean;
  /** Resolved on the server so the year chips match the server render. */
  currentYear: number;
};

/** Bridges the string-valued controls and the numeric ids in the query. */
const toNumeric = (facet: SetFacet<string>): SetFacet<number> => ({
  include: facet.include.map(Number).filter(Number.isFinite),
  exclude: facet.exclude.map(Number).filter(Number.isFinite),
  mode: facet.mode,
});

const toStrings = (facet: SetFacet<number>): SetFacet<string> => ({
  include: facet.include.map(String),
  exclude: facet.exclude.map(String),
  mode: facet.mode,
});

const size = (facet: SetFacet<unknown>) =>
  facet.include.length + facet.exclude.length;

const rangeSize = (
  range: { min?: number; max?: number; exclude: unknown[] },
  /** The vote floor ships at 300, so leaving it there is not an active filter. */
  defaultMin?: number,
) => {
  // A bounded range is one constraint however many ends it has, matching how
  // the active-filter bar renders it.
  const bounded =
    (range.min !== undefined && range.min !== defaultMin) ||
    range.max !== undefined;
  return (bounded ? 1 : 0) + range.exclude.length;
};

export const FilterPanel = ({
  config,
  locale,
  imdbAvailable,
  currentYear,
}: FilterPanelProps) => {
  const t = useTranslations();
  const { query, patch, patchSection, reset } = useFilters();

  const facetLabels: FacetLabels = {
    search: t("filters.search"),
    empty: t("filters.noResults"),
    any: t("filters.any"),
    include: t("filters.include"),
    exclude: t("filters.exclude"),
    matchAny: t("filters.matchAny"),
    matchAll: t("filters.matchAll"),
  };

  const yearLabels: YearLabels = {
    label: t("filters.year.label"),
    exact: t("filters.year.exact"),
    range: t("filters.year.range"),
    from: t("filters.from"),
    to: t("filters.to"),
    addBand: t("filters.addBand"),
    bandsTitle: t("filters.bandsTitle"),
    decade: t("filters.year.decade", { decade: "{decade}" }),
  };

  const rangeLabels: RangeLabels = {
    from: t("filters.from"),
    to: t("filters.to"),
    addBand: t("filters.addBand"),
    bandsTitle: t("filters.bandsTitle"),
  };

  const genreOptions = (
    query.type === "tv" ? config.tvGenres : config.movieGenres
  )
    // Animation lives in its own control above; showing it here too would be
    // two switches for one idea, free to contradict each other.
    .filter((genre) => genre.id !== MOVIE_GENRES.animation)
    .map((genre) => ({ value: String(genre.id), label: genre.name }));

  const showTvSection = query.type === "tv" || query.type === "both";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
          {t("filters.heading")}
        </h2>
        {hasActiveFilters(query) ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-ink-faint transition-colors hover:text-danger"
          >
            <RotateCcw size={12} />
            {t("filters.reset")}
          </button>
        ) : null}
      </div>

      <FilterSection
        title={t("filters.sections.basics")}
        defaultOpen
        activeCount={
          size(query.genres) +
          rangeSize(query.year) +
          (query.animation === "any" ? 0 : 1)
        }
      >
        <Field label={t("filters.type.label")}>
          <Segmented<TitleType>
            value={query.type}
            // Genre ids belong to whichever vocabulary the type selects, so the
            // selection has to be carried across rather than left behind.
            onChange={(type) =>
              patch({
                type,
                genres: retargetGenres(query.genres, query.type, type),
              })
            }
            options={[
              { value: "movie", label: t("filters.type.movie") },
              { value: "tv", label: t("filters.type.tv") },
              { value: "both", label: t("filters.type.both") },
            ]}
          />
        </Field>

        <Field
          label={t("filters.animation.label")}
          hint={t("filters.animation.hint")}
        >
          <AnimationToggle
            value={query.animation}
            onChange={(animation) => patch({ animation })}
          />
        </Field>

        <ChipFacet
          label={t("filters.genres.label")}
          options={genreOptions}
          facet={toStrings(query.genres)}
          onChange={(facet) => patch({ genres: toNumeric(facet) })}
          matchAny={t("filters.matchAny")}
          matchAll={t("filters.matchAll")}
          includeLabel={t("filters.include")}
          excludeLabel={t("filters.exclude")}
          hint={
            query.type !== "movie" &&
            query.genres.include.includes(TV_GENRES.sciFiFantasy)
              ? t("filters.genres.sciFiTvHint")
              : undefined
          }
        />

        <YearField
          range={query.year}
          onChange={(year) => patch({ year })}
          labels={yearLabels}
          currentYear={currentYear}
          minYear={1874}
        />
      </FilterSection>

      {/* People sits high on purpose: it is one of the two reasons this site
          exists, and it was unfindable at the bottom of a flat column. */}
      <FilterSection
        title={t("filters.sections.people")}
        defaultOpen
        activeCount={size(query.cast) + size(query.crew)}
      >
        <AsyncFacetSelect
          label={t("filters.cast.label")}
          kind="person"
          placeholder={t("filters.cast.placeholder")}
          facet={query.cast}
          onChange={(cast) => patch({ cast })}
          labels={facetLabels}
          locale={locale}
          hint={t("filters.cast.hint")}
        />
        <AsyncFacetSelect
          label={t("filters.crew.label")}
          kind="person"
          placeholder={t("filters.crew.placeholder")}
          facet={query.crew}
          onChange={(crew) => patch({ crew })}
          labels={facetLabels}
          locale={locale}
        />
      </FilterSection>

      <FilterSection
        title={t("filters.sections.rating")}
        defaultOpen
        activeCount={
          rangeSize(query.rating.value) +
          rangeSize(query.rating.votes, DEFAULT_FILTERS.rating.votes.min)
        }
      >
        <Field label={t("filters.rating.source")}>
          <Segmented<RatingSource>
            value={query.rating.source}
            onChange={(source) => patchSection("rating", { source })}
            options={[
              { value: "tmdb", label: t("filters.rating.sourceTmdb") },
              { value: "imdb", label: t("filters.rating.sourceImdb") },
              { value: "mixed", label: t("filters.rating.sourceMixed") },
            ]}
          />
          {query.rating.source === "imdb" && !imdbAvailable ? (
            <p className="pt-1 text-[11px] leading-snug text-score">
              {t("filters.rating.imdbUnavailable")}
            </p>
          ) : null}
        </Field>

        <RangeField
          label={t("filters.rating.value")}
          range={query.rating.value}
          onChange={(value) => patchSection("rating", { value })}
          labels={rangeLabels}
          min={0}
          max={10}
          step={0.5}
        />

        <RangeField
          label={t("filters.rating.votes")}
          range={query.rating.votes}
          onChange={(votes) =>
            patchSection("rating", { votes: { ...votes, min: votes.min ?? 0 } })
          }
          labels={rangeLabels}
          min={0}
          step={50}
          hint={t("filters.rating.votesHint")}
          allowBands={false}
        />
      </FilterSection>

      <FilterSection
        title={t("filters.sections.origin")}
        activeCount={
          size(query.countries) + size(query.languages) + size(query.companies)
        }
      >
        <RegionGroups
          countries={query.countries}
          onChange={(countries) => patch({ countries })}
        />

        <FacetSelect
          label={t("filters.countries.label")}
          options={config.countries}
          facet={query.countries}
          onChange={(countries) => patch({ countries })}
          labels={facetLabels}
        />
        <FacetSelect
          label={t("filters.languages.label")}
          options={config.languages}
          facet={query.languages}
          onChange={(languages) => patch({ languages })}
          labels={facetLabels}
          allowMode={false}
        />
        <AsyncFacetSelect
          label={t("filters.companies.label")}
          kind="company"
          placeholder={t("filters.companies.placeholder")}
          facet={query.companies}
          onChange={(companies) => patch({ companies })}
          labels={facetLabels}
          locale={locale}
          hint={t("filters.companies.hint")}
        />
      </FilterSection>

      <FilterSection
        title={t("filters.sections.availability")}
        activeCount={
          size(query.providers) + query.providers.monetization.length
        }
      >
        {config.providers.length ? (
          <FacetSelect
            label={t("filters.providers.label")}
            options={config.providers.map((provider) => ({
              value: String(provider.id),
              label: provider.name,
            }))}
            facet={toStrings(query.providers)}
            onChange={(facet) => patchSection("providers", toNumeric(facet))}
            labels={facetLabels}
            hint={t("filters.providers.hint", {
              region: query.providers.region,
            })}
          />
        ) : (
          <p className="text-xs text-ink-faint">
            {t("filters.providers.unavailable")}
          </p>
        )}

        <Field label={t("filters.monetization.label")}>
          <div className="flex flex-wrap gap-1.5">
            {MONETIZATION_TYPES.map((type) => {
              const active = query.providers.monetization.includes(type);
              return (
                <Chip
                  key={type}
                  active={active}
                  onClick={() =>
                    patchSection("providers", {
                      monetization: active
                        ? query.providers.monetization.filter(
                            (item) => item !== type,
                          )
                        : [
                            ...query.providers.monetization,
                            type as Monetization,
                          ],
                    })
                  }
                >
                  {t(`filters.monetization.${type}`)}
                </Chip>
              );
            })}
          </div>
        </Field>
      </FilterSection>

      <FilterSection
        title={t("filters.sections.details")}
        activeCount={
          rangeSize(query.runtime) +
          size(query.keywords) +
          (query.certification.min || query.certification.max ? 1 : 0)
        }
      >
        <RangeField
          label={t("filters.runtime.label")}
          range={query.runtime}
          onChange={(runtime) => patch({ runtime })}
          labels={rangeLabels}
          min={0}
          step={5}
        />

        <Field
          label={t("filters.certification.label")}
          hint={t("filters.certification.hint")}
        >
          <div className="flex items-center gap-2">
            <select
              value={query.certification.min ?? ""}
              onChange={(event) =>
                patchSection("certification", {
                  min: event.target.value || undefined,
                })
              }
              className={inputClass}
              aria-label={t("filters.from")}
            >
              <option value="">{t("filters.any")}</option>
              {CERT_LADDER.map((cert) => (
                <option key={cert} value={cert}>
                  {cert}
                </option>
              ))}
            </select>
            <span className="text-ink-faint">—</span>
            <select
              value={query.certification.max ?? ""}
              onChange={(event) =>
                patchSection("certification", {
                  max: event.target.value || undefined,
                })
              }
              className={inputClass}
              aria-label={t("filters.to")}
            >
              <option value="">{t("filters.any")}</option>
              {CERT_LADDER.map((cert) => (
                <option key={cert} value={cert}>
                  {cert}
                </option>
              ))}
            </select>
          </div>
        </Field>

        <AsyncFacetSelect
          label={t("filters.keywords.label")}
          kind="keyword"
          placeholder={t("filters.keywords.placeholder")}
          facet={query.keywords}
          onChange={(keywords) => patch({ keywords })}
          labels={facetLabels}
          locale={locale}
          hint={t("filters.keywords.hint")}
        />
      </FilterSection>

      {showTvSection ? (
        <FilterSection
          title={t("filters.sections.tv")}
          activeCount={query.tvStatus.length + query.tvTypes.length}
        >
          <FacetSelect
            label={t("filters.tvStatus.label")}
            options={TV_STATUS.map((entry) => ({
              value: String(entry.value),
              label: t(`filters.tvStatus.${entry.key}`),
            }))}
            facet={{
              include: query.tvStatus.map(String),
              exclude: [],
              mode: "any",
            }}
            onChange={(facet) => patch({ tvStatus: toNumeric(facet).include })}
            labels={facetLabels}
            allowExclude={false}
            allowMode={false}
            hint={t("filters.tvStatus.hint")}
          />
          <FacetSelect
            label={t("filters.tvTypes.label")}
            options={TV_TYPES.map((entry) => ({
              value: String(entry.value),
              label: t(`filters.tvTypes.${entry.key}`),
            }))}
            facet={{
              include: query.tvTypes.map(String),
              exclude: [],
              mode: "any",
            }}
            onChange={(facet) => patch({ tvTypes: toNumeric(facet).include })}
            labels={facetLabels}
            allowExclude={false}
            allowMode={false}
          />
        </FilterSection>
      ) : null}
    </div>
  );
};

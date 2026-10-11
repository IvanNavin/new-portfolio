import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { DemoBanner } from "@/components/DemoBanner";
import { ActiveFilters } from "@/components/filters/ActiveFilters";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { Pagination } from "@/components/filters/Pagination";
import { PresetChips } from "@/components/filters/PresetChips";
import { SortBar } from "@/components/filters/SortBar";
import { MobileFilters } from "@/components/MobileFilters";
import { TitleGrid } from "@/components/title/TitleGrid";
import { defaultRegion } from "@/lib/apiLocale";
import { parseFilterQuery } from "@/lib/filters/schema";
import { routing, TMDB_LOCALE } from "@/lib/i18n/routing";
import { getFilterConfig } from "@/lib/tmdb/config";
import { discover, IMDB_INDEX_AVAILABLE } from "@/lib/tmdb/discover";

/**
 * The catalog is a search page: every render depends on the query string and on
 * a live upstream call, so there is nothing to prerender at build time.
 */
export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const toUrlSearchParams = (input: SearchParams): URLSearchParams => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0] !== undefined)
      params.set(key, value[0]);
  }
  return params;
};

const CatalogPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const query = parseFilterQuery(toUrlSearchParams(await searchParams));
  const language = TMDB_LOCALE[locale];
  const region = defaultRegion();

  const [config, response] = await Promise.all([
    getFilterConfig(language, region),
    discover(query, language),
  ]);

  // Server-resolved so the preset labels and the client render agree.
  const currentYear = new Date().getFullYear();

  const panel = (
    <FilterPanel
      config={config}
      locale={locale}
      imdbAvailable={IMDB_INDEX_AVAILABLE}
      currentYear={currentYear}
    />
  );

  return (
    <div className="space-y-5">
      {response.source === "fixtures" ? <DemoBanner /> : null}

      <PresetChips currentYear={currentYear} />

      <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-6 max-h-[calc(100dvh-3rem)] overflow-y-auto pr-2">
            {panel}
          </div>
        </aside>

        <div className="space-y-4">
          <MobileFilters>{panel}</MobileFilters>

          {/* The showcase: everything currently narrowing the results, removable
              one by one. Especially load-bearing on a phone, where the panel is
              collapsed and nothing else reveals what is on. */}
          <ActiveFilters config={config} locale={locale} />

          <SortBar
            totalResults={response.totalResults}
            approximate={response.approximate}
            scanned={response.scanned}
          />

          <TitleGrid
            results={response.results}
            ratingSource={response.ratingSource}
          />

          <Pagination page={response.page} totalPages={response.totalPages} />
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;

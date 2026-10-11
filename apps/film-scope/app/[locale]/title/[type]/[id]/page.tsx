import { ArrowLeft, ExternalLink, Info } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ScoreBadge } from "@/components/title/ScoreBadge";
import { TitlePoster } from "@/components/title/TitlePoster";
import { defaultRegion } from "@/lib/apiLocale";
import { DEFAULT_FILTERS, serializeFilterQuery } from "@/lib/filters/schema";
import { computeScore } from "@/lib/filters/score";
import type { TitleDetails } from "@/lib/filters/types";
import { Link } from "@/lib/i18n/navigation";
import { routing, TMDB_LOCALE } from "@/lib/i18n/routing";
import { backdropUrl, logoUrl, profileUrl } from "@/lib/tmdb/client";
import { getTitle } from "@/lib/tmdb/title";

const money = (value: number | null, locale: string): string | null =>
  value
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    : null;

/** Link back into the catalog pre-filtered to everything this person is in. */
const personHref = (personId: number): string => {
  const params = serializeFilterQuery({
    ...DEFAULT_FILTERS,
    cast: { ...DEFAULT_FILTERS.cast, include: [personId] },
    // Drop the vote floor: a filmography should show everything, including the
    // obscure early work that is often the reason you are looking.
    rating: { ...DEFAULT_FILTERS.rating, votes: { min: 0, exclude: [] } },
  });
  return `/?${params.toString()}`;
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) =>
  value ? (
    <div className="flex gap-3 border-b border-edge py-2 last:border-0">
      <dt className="w-40 shrink-0 text-sm text-ink-faint">{label}</dt>
      <dd className="text-sm text-ink">{value}</dd>
    </div>
  ) : null;

const TitlePage = async ({
  params,
}: {
  params: Promise<{ locale: string; type: string; id: string }>;
}) => {
  const { locale, type, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  if (type !== "movie" && type !== "tv") notFound();
  setRequestLocale(locale);

  const numericId = Number.parseInt(id, 10);
  if (!Number.isFinite(numericId)) notFound();

  const region = defaultRegion();
  const details: TitleDetails | null = await getTitle(
    type,
    numericId,
    TMDB_LOCALE[locale],
    region,
  );

  const t = await getTranslations({ locale, namespace: "title" });
  const card = await getTranslations({ locale, namespace: "card" });

  if (!details) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink">{t("notFound")}</p>
        <Link
          href="/"
          className="mt-3 inline-block text-sm text-accent hover:underline"
        >
          {t("back")}
        </Link>
      </div>
    );
  }

  const score = computeScore(details.ratings, "tmdb", 300);
  const backdrop = backdropUrl(details.backdropPath);
  const trailer =
    details.videos.find(
      (video) => video.type === "Trailer" && video.official,
    ) ??
    details.videos.find((video) => video.type === "Trailer") ??
    details.videos[0];

  return (
    <article className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} />
        {t("back")}
      </Link>

      <header className="relative overflow-hidden rounded-2xl border border-edge">
        {backdrop ? (
          <div className="absolute inset-0">
            <Image
              src={backdrop}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-surface/40" />
          </div>
        ) : null}

        <div className="relative grid gap-6 p-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:p-7">
          <div className="poster-ratio relative w-40 overflow-hidden rounded-xl border border-edge bg-surface-raised sm:w-full">
            <TitlePoster
              path={details.posterPath}
              alt={details.title}
              sizes="12rem"
              priority
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {details.title}
              </h1>
              <ScoreBadge
                score={score}
                raw={details.ratings.tmdb?.value}
                votes={details.ratings.tmdb?.votes}
                className="text-sm"
              />
            </div>

            {details.tagline ? (
              <p className="text-sm italic text-ink-dim">{details.tagline}</p>
            ) : null}

            <p className="text-sm text-ink-faint">
              {[
                details.year,
                details.runtime
                  ? card("minutes", { count: details.runtime })
                  : null,
                details.certification,
                details.genres.map((genre) => genre.name).join(", ") || null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>

            <div className="space-y-1.5 pt-1">
              <h2 className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                {t("overview")}
              </h2>
              {details.overview ? (
                <p className="max-w-3xl text-sm leading-relaxed text-ink-dim">
                  {details.overview}
                </p>
              ) : (
                <p className="text-sm text-ink-faint">{t("noOverview")}</p>
              )}
              {details.overviewFallback ? (
                <p className="inline-flex items-center gap-1.5 text-[11px] text-score">
                  <Info size={11} />
                  {t("overviewFallback")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {trailer ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
            {t("trailer")}
          </h2>
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-edge">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
              title={trailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
          {t("whereToWatch")}
        </h2>
        {details.providers.items.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {details.providers.items.map((provider) => {
              const logo = logoUrl(provider.logoPath);
              return (
                <span
                  key={`${provider.id}-${provider.monetization}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-edge bg-surface-raised px-2.5 py-1.5 text-xs text-ink-dim"
                >
                  {logo ? (
                    <Image
                      src={logo}
                      alt=""
                      width={20}
                      height={20}
                      className="rounded"
                    />
                  ) : null}
                  {provider.name}
                  <span className="text-ink-faint">
                    {provider.monetization}
                  </span>
                </span>
              );
            })}
            {details.providers.link ? (
              <a
                href={details.providers.link}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
              >
                JustWatch
                <ExternalLink size={11} />
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-ink-faint">{t("noProviders")}</p>
        )}
      </section>

      {details.cast.length ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
            {t("cast")}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {details.cast.slice(0, 12).map((person) => {
              const photo = profileUrl(person.profilePath);
              return (
                <li key={person.id}>
                  <Link
                    href={personHref(person.id)}
                    title={t("filterByPerson", { name: person.name })}
                    className="group flex items-center gap-2.5 rounded-lg border border-edge bg-surface-raised p-2 transition-colors hover:border-edge-strong"
                  >
                    {photo ? (
                      <Image
                        src={photo}
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="size-9 shrink-0 rounded-full bg-surface-sunken" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-ink group-hover:text-accent">
                        {person.name}
                      </span>
                      <span className="block truncate text-[11px] text-ink-faint">
                        {person.role}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
          {t("details")}
        </h2>
        <dl className="max-w-2xl">
          <DetailRow label={t("originalTitle")} value={details.originalTitle} />
          <DetailRow
            label={t("originalLanguage")}
            value={details.originalLanguage}
          />
          <DetailRow
            label={t("countries")}
            value={
              details.productionCountries
                .map((entry) => entry.name)
                .join(", ") || null
            }
          />
          <DetailRow
            label={t("companies")}
            value={
              details.productionCompanies
                .map((entry) => entry.name)
                .join(", ") || null
            }
          />
          <DetailRow label={t("status")} value={details.status || null} />
          <DetailRow label={t("certification")} value={details.certification} />
          <DetailRow
            label={t("budget")}
            value={money(details.budget, locale)}
          />
          <DetailRow
            label={t("revenue")}
            value={money(details.revenue, locale)}
          />
          <DetailRow
            label={t("seasonsLabel")}
            value={details.seasons ? String(details.seasons) : null}
          />
          <DetailRow
            label={t("episodesLabel")}
            value={details.episodes ? String(details.episodes) : null}
          />
          <DetailRow
            label={t("crew")}
            value={
              details.crew
                .map((person) => `${person.name} (${person.role})`)
                .join(", ") || null
            }
          />
        </dl>
      </section>

      {details.similar.length ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
            {t("similar")}
          </h2>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {details.similar.slice(0, 12).map((item) => (
              <li key={`${item.mediaType}-${item.id}`}>
                <Link
                  href={`/title/${item.mediaType}/${item.id}`}
                  className="group block"
                >
                  <div className="poster-ratio relative overflow-hidden rounded-lg border border-edge bg-surface-raised transition-colors group-hover:border-edge-strong">
                    <TitlePoster
                      path={item.posterPath}
                      alt={item.title}
                      sizes="16vw"
                    />
                  </div>
                  <p className="line-clamp-2 pt-1.5 text-xs text-ink-dim group-hover:text-accent">
                    {item.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
};

export default TitlePage;

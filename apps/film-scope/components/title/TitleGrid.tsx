import { useTranslations } from "next-intl";

import { ScoreBadge } from "@/components/title/ScoreBadge";
import { TitlePoster } from "@/components/title/TitlePoster";
import type { RatingSource } from "@/lib/filters/schema";
import { rawRating } from "@/lib/filters/score";
import type { TitleCard } from "@/lib/filters/types";
import { Link } from "@/lib/i18n/navigation";

const GRID_SIZES = "(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 15vw";

export const TitleGrid = ({
  results,
  ratingSource,
}: {
  results: TitleCard[];
  ratingSource: RatingSource;
}) => {
  const t = useTranslations();

  if (!results.length) {
    return (
      <div className="rounded-xl border border-dashed border-edge px-6 py-16 text-center">
        <p className="text-ink">{t("results.empty")}</p>
        <p className="pt-1 text-sm text-ink-faint">{t("results.emptyHint")}</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {results.map((item, index) => {
        const raw = rawRating(item.ratings, ratingSource);
        return (
          <li key={`${item.mediaType}-${item.id}`}>
            <Link
              href={`/title/${item.mediaType}/${item.id}`}
              className="group block focus:outline-none"
            >
              <div className="poster-ratio relative overflow-hidden rounded-xl border border-edge bg-surface-raised transition-colors group-hover:border-edge-strong group-focus-visible:border-accent">
                <TitlePoster
                  path={item.posterPath}
                  alt={item.title}
                  sizes={GRID_SIZES}
                  priority={index < 5}
                />
                <ScoreBadge
                  score={item.score}
                  raw={raw?.value}
                  votes={raw?.votes}
                  className="absolute left-2 top-2"
                />
              </div>

              <div className="pt-2">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-ink group-hover:text-accent">
                  {item.title}
                </p>
                <p className="pt-0.5 text-xs text-ink-faint">
                  {[
                    item.year,
                    raw
                      ? t("card.votes", { count: raw.votes })
                      : t("card.noRating"),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

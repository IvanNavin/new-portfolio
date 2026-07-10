"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { AdminDeleteButton } from "@/components/admin/AdminDeleteButton";
import { CompareToggle } from "@/components/compare/CompareToggle";
import { LevelMeter } from "@/components/ui/LevelMeter";
import { BudgetRange, Money } from "@/components/ui/Money";
import { Link } from "@/i18n/navigation";
import { calculate } from "@/lib/calculations";
import { classifyPayback, formatNumber } from "@/lib/format";
import type { Business } from "@/lib/types";

export function BusinessCard({
  business,
  order,
}: {
  business: Business;
  order: number;
}) {
  const t = useTranslations("card");
  const tm = useTranslations("meters");
  const tcat = useTranslations("categories");
  const tp = useTranslations("payback");
  const locale = useLocale();

  // Орієнтовна економіка з дефолтних (заземлених) значень калькулятора
  const result = useMemo(() => calculate(business.defaults), [business]);
  const payback = classifyPayback(result.paybackMonths);
  const paybackText =
    payback.kind === "months"
      ? tp("months", { months: formatNumber(payback.months, locale) })
      : tp(payback.kind);

  return (
    <article
      className="rise-in group flex flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-hard transition-transform duration-150 hover:-translate-y-1 hover:shadow-hard-accent"
      style={{ animationDelay: `${order * 60}ms` }}
    >
      <header className="flex items-start justify-between gap-2 border-b border-line px-4 pb-3 pt-4">
        <div>
          <span className="inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent-deep">
            {tcat(business.category)}
          </span>
          <h2 className="mt-2 font-display text-lg font-bold leading-snug">
            {business.name}
          </h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5">
            <AdminDeleteButton slug={business.slug} name={business.name} />
            <CompareToggle slug={business.slug} />
          </div>
          <span className="font-mono text-xs text-ink-faint">
            №{String(order + 1).padStart(2, "0")}
          </span>
        </div>
      </header>

      <div className="flex grow flex-col gap-3 px-4 py-3">
        <p className="text-sm leading-relaxed text-ink-soft">
          {business.shortDescription}
        </p>

        <div className="mt-auto flex flex-col gap-1.5">
          <p className="flex items-baseline justify-between gap-2">
            <span className="text-xs uppercase tracking-wider text-ink-faint">
              {t("startFrom")}
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              <BudgetRange
                min={business.recommendedBudget.min}
                max={business.recommendedBudget.max}
              />
            </span>
          </p>
          <p className="flex items-baseline justify-between gap-2">
            <span className="text-xs uppercase tracking-wider text-ink-faint">
              {t("netPerMonth")}
            </span>
            <span
              className={`font-mono text-sm font-semibold tabular-nums ${
                result.netProfit >= 0 ? "text-accent" : "text-loss"
              }`}
            >
              <Money uah={result.netProfit} compact />
            </span>
          </p>
          <p className="flex items-baseline justify-between gap-2">
            <span className="text-xs uppercase tracking-wider text-ink-faint">
              {t("payback")}
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {paybackText}
            </span>
          </p>
          <LevelMeter
            label={tm("difficulty")}
            value={business.difficulty}
            variant="difficulty"
          />
          <LevelMeter label={tm("risk")} value={business.risk} variant="risk" />
        </div>
      </div>

      <Link
        href={`/business/${business.slug}`}
        className="bg-accent px-4 py-3 text-center text-sm font-semibold uppercase tracking-widest text-[color:var(--color-on-accent)] transition-colors group-hover:bg-accent-deep"
      >
        {t("open")}
      </Link>
    </article>
  );
}

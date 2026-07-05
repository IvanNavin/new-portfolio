"use client";

import { useLocale, useTranslations } from "next-intl";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { CompareChart } from "@/components/compare/CompareChart";
import { calculate } from "@/lib/calculations";
import { MAX_COMPARE, useCompareStore } from "@/lib/compareStore";
import { classifyPayback, formatNumber, formatPercent } from "@/lib/format";
import { useCurrency } from "@/lib/hooks/useCurrency";
import type { Business, CalculationResult } from "@/lib/types";

interface RowDef {
  key: string;
  /** Числове значення для визначення найкращого (NaN — не порівнюємо) */
  value: (result: CalculationResult, business: Business) => number;
  display: (result: CalculationResult, business: Business) => string;
  /** Найкраще — це найменше значення? */
  lower: boolean;
  /** Категоріальний рядок — без підсвітки «найкращого» */
  noBest?: boolean;
}

interface GroupDef {
  key: string;
  rows: string[];
}

const GROUPS: GroupDef[] = [
  { key: "groupSummary", rows: ["rowNet", "rowPayback", "rowProfit"] },
  {
    key: "groupMoney",
    rows: ["rowRevenue", "rowCosts", "rowStartup", "rowBreakEven"],
  },
  {
    key: "groupProfile",
    rows: ["rowBudget", "rowCategory", "rowDifficulty", "rowRisk"],
  },
];

export function CompareView({ businesses }: { businesses: Business[] }) {
  const t = useTranslations("compare");
  const tcat = useTranslations("categories");
  const tp = useTranslations("payback");
  const locale = useLocale();
  const { money, budget } = useCurrency();

  const allSlugs = useMemo(() => businesses.map((b) => b.slug), [businesses]);
  const selected = useCompareStore((state) => state.selected);
  const setSelected = useCompareStore((state) => state.setSelected);
  const toggle = useCompareStore((state) => state.toggle);
  const hydrate = useCompareStore((state) => state.hydrate);
  const [onlyDiff, setOnlyDiff] = useState(false);

  // На вході: якщо в URL є ?ids= — беремо їх, інакше — збережений вибір
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("ids");
    if (fromUrl) {
      setSelected(
        fromUrl
          .split(",")
          .map((s) => s.trim())
          .filter((s) => allSlugs.includes(s)),
      );
    } else {
      hydrate();
    }
  }, [allSlugs, setSelected, hydrate]);

  // Тримаємо ?ids= в URL для шерингу
  useEffect(() => {
    const ids = selected.join(",");
    const url = new URL(window.location.href);
    if (ids) url.searchParams.set("ids", ids);
    else url.searchParams.delete("ids");
    window.history.replaceState(null, "", url);
  }, [selected]);

  const paybackText = (months: number | null): string => {
    const info = classifyPayback(months);
    return info.kind === "months"
      ? tp("months", { months: formatNumber(info.months, locale) })
      : tp(info.kind);
  };

  const rowDefs: Record<string, RowDef> = {
    rowNet: {
      key: "rowNet",
      value: (r) => r.netProfit,
      display: (r) => money(r.netProfit),
      lower: false,
    },
    rowPayback: {
      key: "rowPayback",
      value: (r) => r.paybackMonths ?? Infinity,
      display: (r) => paybackText(r.paybackMonths),
      lower: true,
    },
    rowProfit: {
      key: "rowProfit",
      value: (r) => r.profitabilityPercent,
      display: (r) => formatPercent(r.profitabilityPercent, locale),
      lower: false,
    },
    rowRevenue: {
      key: "rowRevenue",
      value: (r) => r.monthlyRevenue,
      display: (r) => money(r.monthlyRevenue),
      lower: false,
    },
    rowCosts: {
      key: "rowCosts",
      value: (r) => r.monthlyCostsTotal,
      display: (r) => money(r.monthlyCostsTotal),
      lower: true,
    },
    rowStartup: {
      key: "rowStartup",
      value: (r) => r.startupTotal,
      display: (r) => money(r.startupTotal),
      lower: true,
    },
    rowBreakEven: {
      key: "rowBreakEven",
      value: (r) => r.breakEvenClientsPerDay,
      display: (r) => formatNumber(r.breakEvenClientsPerDay, locale),
      lower: true,
    },
    rowBudget: {
      key: "rowBudget",
      value: (_r, b) => b.recommendedBudget.min,
      display: (_r, b) =>
        budget(b.recommendedBudget.min, b.recommendedBudget.max),
      lower: true,
    },
    rowCategory: {
      key: "rowCategory",
      value: () => NaN,
      display: (_r, b) => tcat(b.category),
      lower: true,
      noBest: true,
    },
    rowDifficulty: {
      key: "rowDifficulty",
      value: (_r, b) => b.difficulty,
      display: (_r, b) => `${b.difficulty}/5`,
      lower: true,
    },
    rowRisk: {
      key: "rowRisk",
      value: (_r, b) => b.risk,
      display: (_r, b) => `${b.risk}/5`,
      lower: true,
    },
  };

  const columns = selected
    .map((slug) => businesses.find((b) => b.slug === slug))
    .filter((b): b is Business => Boolean(b))
    .map((business) => ({ business, result: calculate(business.defaults) }));

  const chartItems = columns.map(({ business, result }) => ({
    name: business.name,
    netProfit: result.netProfit,
  }));

  const bestIndex = (row: RowDef): number => {
    if (row.noBest) return -1;
    let best = -1;
    let bestVal = row.lower ? Infinity : -Infinity;
    columns.forEach(({ business, result }, index) => {
      const v = row.value(result, business);
      if (!Number.isFinite(v)) return;
      if (row.lower ? v < bestVal : v > bestVal) {
        bestVal = v;
        best = index;
      }
    });
    return best;
  };

  const isSame = (row: RowDef): boolean => {
    const values = columns.map((c) => row.display(c.result, c.business));
    return values.every((v) => v === values[0]);
  };

  // Плоский список рядків таблиці з заголовками груп
  const tableRows: ReactNode[] = [];
  if (columns.length >= 2) {
    GROUPS.forEach((group) => {
      const rows = group.rows
        .map((key) => rowDefs[key])
        .filter((row) => (onlyDiff ? !isSame(row) : true));
      if (rows.length === 0) return;

      tableRows.push(
        <tr key={`group-${group.key}`}>
          <th
            colSpan={columns.length + 1}
            className="border-b border-line bg-paper px-4 py-2 text-left"
          >
            <span className="sticky left-4 font-display text-xs font-semibold uppercase tracking-wider text-ink-soft">
              {t(group.key)}
            </span>
          </th>
        </tr>,
      );

      rows.forEach((row) => {
        const best = bestIndex(row);
        tableRows.push(
          <tr key={row.key} className="border-b border-line last:border-b-0">
            <th className="sticky left-0 z-10 min-w-[150px] bg-card px-4 py-2.5 text-left text-xs font-normal uppercase tracking-wider text-ink-soft">
              {t(row.key)}
            </th>
            {columns.map((column, index) => (
              <td
                key={column.business.slug}
                className={`min-w-[140px] px-4 py-2.5 font-mono tabular-nums ${
                  index === best ? "font-semibold text-accent" : "text-ink"
                }`}
              >
                {row.display(column.result, column.business)}
                {index === best ? (
                  <span className="ml-1 text-accent" aria-hidden>
                    ●
                  </span>
                ) : null}
              </td>
            ))}
          </tr>,
        );
      });
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
          {t("lead")}
        </p>
        <p className="mt-3 border-l-2 border-amber bg-amber/10 px-3 py-2 text-xs leading-relaxed text-ink-soft">
          {t("approx")}
        </p>
      </header>

      {/* Вибір бізнесів */}
      <section>
        <p className="mb-2 text-xs uppercase tracking-wider text-ink-faint">
          {t("pick")} · {t("limitHint", { max: MAX_COMPARE })}
        </p>
        <div className="flex flex-wrap gap-2">
          {businesses.map((business) => {
            const active = selected.includes(business.slug);
            const disabled = !active && selected.length >= MAX_COMPARE;
            return (
              <button
                key={business.slug}
                type="button"
                onClick={() => toggle(business.slug)}
                disabled={disabled}
                aria-pressed={active}
                className={`rounded-full border border-line px-3 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-accent text-[color:var(--color-on-accent)]"
                    : disabled
                      ? "cursor-not-allowed bg-card text-ink-faint opacity-40"
                      : "bg-card text-ink hover:bg-accent-soft"
                }`}
              >
                {business.name}
              </button>
            );
          })}
        </div>
      </section>

      {columns.length < 2 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-ink-faint">
          {t("emptyHint")}
        </p>
      ) : (
        <>
          {/* Перемикач «лише відмінності» */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={onlyDiff}
              onClick={() => setOnlyDiff((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full border border-line transition-colors ${
                onlyDiff ? "bg-accent" : "bg-card"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full border border-line bg-card transition-all ${
                  onlyDiff ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
            <span className="text-sm font-semibold text-ink">
              {t("onlyDiff")}
            </span>
          </div>

          {/* Таблиця порівняння (стиль Rozetka) */}
          <section className="overflow-x-auto overflow-hidden rounded-2xl border border-line bg-card shadow-hard">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-30 min-w-[150px] border-b-2 border-r border-line bg-card px-4 py-3 text-left text-xs uppercase tracking-wider text-ink-faint">
                    {t("metric")}
                  </th>
                  {columns.map(({ business, result }) => {
                    const profitable = result.netProfit >= 0;
                    return (
                      <th
                        key={business.slug}
                        className="sticky top-0 z-20 min-w-[160px] border-b border-l border-line bg-card px-4 py-3 text-left align-top"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-block rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-deep">
                            {tcat(business.category)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggle(business.slug)}
                            aria-label={t("remove")}
                            title={t("remove")}
                            className="-mr-1 -mt-1 px-1 text-base leading-none text-ink-faint transition-colors hover:text-loss"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="mt-1.5 font-display text-base font-bold leading-tight">
                          {business.name}
                        </p>
                        <p
                          className={`mt-1 font-mono text-sm font-semibold tabular-nums ${
                            profitable ? "text-accent" : "text-loss"
                          }`}
                        >
                          {money(result.netProfit)}
                        </p>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
          </section>

          {/* Графік як візуальний підсумок */}
          <section className="rounded-2xl border border-line bg-card p-4 shadow-hard">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide">
              {t("chartTitle")}
            </h2>
            <CompareChart items={chartItems} />
          </section>
        </>
      )}
    </div>
  );
}

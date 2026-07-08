"use client";

import { useLocale, useTranslations } from "next-intl";

import { calculate } from "@/lib/calculations";
import { classifyPayback, formatNumber, formatPercent } from "@/lib/format";
import { useCurrency } from "@/lib/hooks/useCurrency";
import type { Scenario } from "@/lib/store";
import type { CalculationResult } from "@/lib/types";

interface ScenarioCompareProps {
  scenarios: Scenario[];
  activeId: string;
  onSelect: (id: string) => void;
}

interface RowDef {
  key: string;
  value: (r: CalculationResult) => number;
  display: (r: CalculationResult) => string;
  /** Найкраще — найменше значення? */
  lower: boolean;
}

/** Порівняння сценаріїв одного бізнесу: показується, коли їх ≥ 2 */
export function ScenarioCompare({
  scenarios,
  activeId,
  onSelect,
}: ScenarioCompareProps) {
  const t = useTranslations("scenarios");
  const tc = useTranslations("compare");
  const tp = useTranslations("payback");
  const locale = useLocale();
  const { money } = useCurrency();

  if (scenarios.length < 2) return null;

  const paybackText = (months: number | null): string => {
    const info = classifyPayback(months);
    return info.kind === "months"
      ? tp("months", { months: formatNumber(info.months, locale) })
      : tp(info.kind);
  };

  const rows: RowDef[] = [
    {
      key: "rowNet",
      value: (r) => r.netProfit,
      display: (r) => money(r.netProfit),
      lower: false,
    },
    {
      key: "rowPayback",
      value: (r) => r.paybackMonths ?? Infinity,
      display: (r) => paybackText(r.paybackMonths),
      lower: true,
    },
    {
      key: "rowProfit",
      value: (r) => r.profitabilityPercent,
      display: (r) => formatPercent(r.profitabilityPercent, locale),
      lower: false,
    },
    {
      key: "rowRevenue",
      value: (r) => r.monthlyRevenue,
      display: (r) => money(r.monthlyRevenue),
      lower: false,
    },
    {
      key: "rowCosts",
      value: (r) => r.monthlyCostsTotal,
      display: (r) => money(r.monthlyCostsTotal),
      lower: true,
    },
    {
      key: "rowStartup",
      value: (r) => r.startupTotal,
      display: (r) => money(r.startupTotal),
      lower: true,
    },
  ];

  const columns = scenarios.map((scenario) => ({
    scenario,
    result: calculate(scenario.inputs),
  }));

  const bestIndex = (row: RowDef): number => {
    let best = -1;
    let bestVal = row.lower ? Infinity : -Infinity;
    columns.forEach(({ result }, index) => {
      const v = row.value(result);
      if (!Number.isFinite(v)) return;
      if (row.lower ? v < bestVal : v > bestVal) {
        bestVal = v;
        best = index;
      }
    });
    return best;
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-hard">
      <h3 className="border-b border-line px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide">
        {t("compareTitle")}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[140px] border-b border-line bg-card px-4 py-2.5 text-left text-xs font-normal uppercase tracking-wider text-ink-faint">
                {tc("metric")}
              </th>
              {columns.map(({ scenario }, index) => {
                const active = scenario.id === activeId;
                return (
                  <th
                    key={scenario.id}
                    className="min-w-[130px] border-b border-l border-line px-4 py-2.5 text-left"
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(scenario.id)}
                      className={`font-display text-sm font-bold transition-colors ${
                        active ? "text-accent" : "text-ink hover:text-accent"
                      }`}
                    >
                      {t("variant", { n: index + 1 })}
                      {active ? (
                        <span className="ml-1.5 align-middle text-[9px] font-semibold uppercase tracking-wider text-ink-faint">
                          {t("activeMark")}
                        </span>
                      ) : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const best = bestIndex(row);
              return (
                <tr key={row.key} className="border-b border-line">
                  <th className="sticky left-0 z-10 border-b border-line bg-card px-4 py-2.5 text-left text-xs font-normal uppercase tracking-wider text-ink-soft">
                    {tc(row.key)}
                  </th>
                  {columns.map(({ scenario, result }, index) => (
                    <td
                      key={scenario.id}
                      className={`border-b border-l border-line px-4 py-2.5 font-mono tabular-nums ${
                        index === best
                          ? "font-semibold text-accent"
                          : "text-ink"
                      }`}
                    >
                      {row.display(result)}
                      {index === best ? (
                        <span className="ml-1 text-accent" aria-hidden>
                          ●
                        </span>
                      ) : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

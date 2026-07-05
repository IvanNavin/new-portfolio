"use client";

import { useLocale, useTranslations } from "next-intl";

import { classifyPayback, formatNumber, formatPercent } from "@/lib/format";
import { useCurrency } from "@/lib/hooks/useCurrency";
import type { CalculationResult } from "@/lib/types";

interface MetricProps {
  label: string;
  value: string;
  hint?: string;
}

function Metric({ label, value, hint }: MetricProps) {
  return (
    <div className="border-b border-line py-2.5 last:border-b-0">
      <dt className="text-xs uppercase tracking-wider text-ink-soft">
        {label}
      </dt>
      <dd className="mt-0.5 font-mono text-base font-semibold tabular-nums">
        {value}
        {hint ? (
          <span className="ml-1.5 font-sans text-xs font-normal text-ink-faint">
            {hint}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

interface ResultsPanelProps {
  result: CalculationResult;
  onReset: () => void;
}

export function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  const profitable = result.netProfit > 0;
  const { money, currency, rate } = useCurrency();
  const locale = useLocale();
  const t = useTranslations("results");
  const tp = useTranslations("payback");

  const payback = classifyPayback(result.paybackMonths);
  const paybackText =
    payback.kind === "months"
      ? tp("months", { months: formatNumber(payback.months, locale) })
      : tp(payback.kind);

  return (
    <aside className="overflow-hidden rounded-2xl border border-line bg-card text-ink shadow-hard">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide">
          {t("title")}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
            profitable
              ? "bg-accent-soft text-accent-deep"
              : "bg-loss/10 text-loss"
          }`}
        >
          {profitable ? t("profitable") : t("unprofitable")}
        </span>
      </header>

      <div className="px-4 py-4">
        <p className="text-xs uppercase tracking-wider text-ink-faint">
          {t("netProfitMonth")}
        </p>
        <p
          className={`mt-1 font-display text-3xl font-bold tabular-nums ${
            profitable ? "text-accent" : "text-loss"
          }`}
        >
          {money(result.netProfit)}
        </p>

        <dl className="mt-4 border-t border-line">
          <Metric
            label={t("monthlyRevenue")}
            value={money(result.monthlyRevenue)}
          />
          <Metric label={t("grossProfit")} value={money(result.grossProfit)} />
          <Metric
            label={t("monthlyCosts")}
            value={money(result.monthlyCostsTotal)}
          />
          <Metric
            label={t("startupTotal")}
            value={money(result.startupTotal)}
          />
          <Metric
            label={t("breakEven")}
            value={money(result.breakEvenRevenue)}
            hint={t("breakEvenHint", {
              clients: formatNumber(result.breakEvenClientsPerDay, locale),
            })}
          />
          <Metric label={t("payback")} value={paybackText} />
          <Metric
            label={t("profitability")}
            value={formatPercent(result.profitabilityPercent, locale)}
          />
        </dl>

        {currency.code !== "UAH" ? (
          <p className="mt-3 text-center font-mono text-[10px] tracking-wide text-ink-faint">
            {t("rateNote", {
              code: currency.code,
              rate: formatNumber(rate, locale),
            })}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onReset}
          className="mt-3 w-full rounded-lg border border-line px-3 py-2 text-xs font-semibold uppercase tracking-widest text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          {t("reset")}
        </button>
      </div>
    </aside>
  );
}

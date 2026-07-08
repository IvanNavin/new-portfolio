"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { AdminNumberInput } from "@/components/admin/AdminNumberInput";
import { ChartCard } from "@/components/calculator/Calculator";
import { ResultsPanel } from "@/components/calculator/ResultsPanel";
import { SectionCard } from "@/components/calculator/SectionCard";
import { CostStructureChart } from "@/components/charts/CostStructureChart";
import { CumulativeProfitChart } from "@/components/charts/CumulativeProfitChart";
import { IncomeVsCostsChart } from "@/components/charts/IncomeVsCostsChart";
import {
  buildCumulativeProfitSeries,
  calculate,
  sumMonthlyCosts,
  sumStartupCosts,
} from "@/lib/calculations";
import { MONTHLY_FIELD_KEYS, STARTUP_FIELD_KEYS } from "@/lib/fieldConfig";
import { useCurrency } from "@/lib/hooks/useCurrency";
import type {
  CalculatorInputs,
  FieldOverride,
  FieldOverrides,
  RevenueFieldLabels,
  RevenueInputs,
} from "@/lib/types";

interface AdminCalculatorProps {
  defaults: CalculatorInputs;
  onDefaultsChange: (defaults: CalculatorInputs) => void;
  /** Перевизначення підписів/підказок для мови активної вкладки */
  overrides: FieldOverrides | undefined;
  onOverridesChange: (overrides: FieldOverrides) => void;
  revenueLabels: RevenueFieldLabels | undefined;
  onRevenueLabelsChange: (labels: RevenueFieldLabels) => void;
  /** «Скинути» на панелі результатів: повертає дефолти до збережених */
  onReset: () => void;
}

const labelInputCls =
  "w-full border-b border-dashed border-transparent bg-transparent text-sm text-ink-soft transition-colors hover:border-line focus:border-accent focus:outline-none";
const hintInputCls =
  "mt-1 w-full border-b border-dashed border-transparent bg-transparent text-xs leading-snug text-ink-faint transition-colors hover:border-line focus:border-accent focus:outline-none";

/**
 * Рядок поля як у калькулятора, але назва й підказка редагуються на місці.
 * Показуємо чинний текст (перевизначення або стандарт); якщо ввести стандартний
 * текст чи стерти все — перевизначення знімається.
 */
function EditableRow({
  defaultLabel,
  defaultHint,
  override,
  onOverride,
  children,
}: {
  defaultLabel: string;
  defaultHint: string;
  override: FieldOverride | undefined;
  onOverride: (next: FieldOverride) => void;
  children: React.ReactNode;
}) {
  const patch = (field: keyof FieldOverride, fallback: string, raw: string) => {
    const trimmed = raw.trim();
    onOverride({
      ...override,
      [field]: !trimmed || trimmed === fallback ? undefined : raw,
    });
  };

  return (
    <div className="border-b border-line py-2 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <input
          value={override?.label ?? defaultLabel}
          onChange={(e) => patch("label", defaultLabel, e.target.value)}
          title="Назва поля — редагується"
          className={labelInputCls}
        />
        {children}
      </div>
      <input
        value={override?.hint ?? defaultHint}
        onChange={(e) => patch("hint", defaultHint, e.target.value)}
        placeholder="Підказка до поля…"
        title="Підказка ⓘ — редагується"
        className={hintInputCls}
      />
    </div>
  );
}

/** Той самий екран калькулятора, але редагує дефолти бізнесу (у гривнях) */
export function AdminCalculator({
  defaults,
  onDefaultsChange,
  overrides,
  onOverridesChange,
  revenueLabels,
  onRevenueLabelsChange,
  onReset,
}: AdminCalculatorProps) {
  const t = useTranslations("calculator");
  const tf = useTranslations("fields");
  const th = useTranslations("fieldHints");
  const tr = useTranslations("revenue");
  const tc = useTranslations("charts");
  const { money } = useCurrency();

  const result = useMemo(() => calculate(defaults), [defaults]);
  const cumulativeSeries = useMemo(
    () => buildCumulativeProfitSeries(result),
    [result],
  );

  const setOverride = (
    section: "startup" | "monthly",
    key: string,
    next: FieldOverride,
  ) => {
    const base: FieldOverrides = { ...overrides };
    const sec = { ...((base[section] ?? {}) as Record<string, FieldOverride>) };
    if (!next.label && !next.hint) delete sec[key];
    else sec[key] = next;
    onOverridesChange({ ...base, [section]: sec });
  };

  const setRevenueValue = (key: keyof RevenueInputs, value: number) =>
    onDefaultsChange({
      ...defaults,
      revenue: { ...defaults.revenue, [key]: value },
    });

  const setRevenueLabel = (key: keyof RevenueFieldLabels, raw: string) => {
    const fallback = tr(key);
    const trimmed = raw.trim();
    onRevenueLabelsChange({
      ...revenueLabels,
      [key]: !trimmed || trimmed === fallback ? undefined : raw,
    });
  };

  const uah = <span className="w-6 font-mono text-xs text-ink-faint">₴</span>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          <SectionCard
            index="01"
            title={t("startupTitle")}
            totalLabel={t("totalLabel")}
            totalValue={money(sumStartupCosts(defaults.startup))}
          >
            {STARTUP_FIELD_KEYS.map((key) => (
              <EditableRow
                key={key}
                defaultLabel={tf(`startup.${key}`)}
                defaultHint={th(`startup.${key}`)}
                override={overrides?.startup?.[key]}
                onOverride={(next) => setOverride("startup", key, next)}
              >
                <span className="flex items-center gap-1.5">
                  <AdminNumberInput
                    value={defaults.startup[key]}
                    onChange={(value) =>
                      onDefaultsChange({
                        ...defaults,
                        startup: { ...defaults.startup, [key]: value },
                      })
                    }
                    ariaLabel={tf(`startup.${key}`)}
                    className="w-28"
                  />
                  {uah}
                </span>
              </EditableRow>
            ))}
          </SectionCard>

          <SectionCard
            index="02"
            title={t("monthlyTitle")}
            totalLabel={t("totalMonthlyLabel")}
            totalValue={money(sumMonthlyCosts(defaults.monthly))}
          >
            {MONTHLY_FIELD_KEYS.map((key) => (
              <EditableRow
                key={key}
                defaultLabel={tf(`monthly.${key}`)}
                defaultHint={th(`monthly.${key}`)}
                override={overrides?.monthly?.[key]}
                onOverride={(next) => setOverride("monthly", key, next)}
              >
                <span className="flex items-center gap-1.5">
                  <AdminNumberInput
                    value={defaults.monthly[key]}
                    onChange={(value) =>
                      onDefaultsChange({
                        ...defaults,
                        monthly: { ...defaults.monthly, [key]: value },
                      })
                    }
                    ariaLabel={tf(`monthly.${key}`)}
                    className="w-28"
                  />
                  {uah}
                </span>
              </EditableRow>
            ))}
          </SectionCard>

          <SectionCard
            index="03"
            title={t("revenueTitle")}
            totalLabel={t("revenueTotalLabel")}
            totalValue={money(result.monthlyRevenue)}
          >
            {/* Клієнтів/день і середній чек: підпис теж редагується */}
            <div className="border-b border-line py-2">
              <div className="flex items-center justify-between gap-3">
                <input
                  value={revenueLabels?.clientsPerDay ?? tr("clientsPerDay")}
                  onChange={(e) =>
                    setRevenueLabel("clientsPerDay", e.target.value)
                  }
                  title="Підпис поля — редагується"
                  className={labelInputCls}
                />
                <AdminNumberInput
                  value={defaults.revenue.clientsPerDay}
                  onChange={(value) => setRevenueValue("clientsPerDay", value)}
                  ariaLabel={tr("clientsPerDay")}
                  className="w-28"
                />
              </div>
            </div>
            <div className="border-b border-line py-2">
              <div className="flex items-center justify-between gap-3">
                <input
                  value={revenueLabels?.averageCheck ?? tr("averageCheck")}
                  onChange={(e) =>
                    setRevenueLabel("averageCheck", e.target.value)
                  }
                  title="Підпис поля — редагується"
                  className={labelInputCls}
                />
                <span className="flex items-center gap-1.5">
                  <AdminNumberInput
                    value={defaults.revenue.averageCheck}
                    onChange={(value) => setRevenueValue("averageCheck", value)}
                    ariaLabel={tr("averageCheck")}
                    className="w-28"
                  />
                  {uah}
                </span>
              </div>
            </div>
            <div className="border-b border-line py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink-soft">{tr("workDays")}</span>
                <AdminNumberInput
                  value={defaults.revenue.workDaysPerMonth}
                  onChange={(value) =>
                    setRevenueValue("workDaysPerMonth", value)
                  }
                  min={1}
                  max={31}
                  ariaLabel={tr("workDays")}
                  className="w-28"
                />
              </div>
            </div>
            <div className="py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink-soft">{tr("margin")}</span>
                <span className="flex items-center gap-1.5">
                  <AdminNumberInput
                    value={defaults.revenue.marginPercent}
                    onChange={(value) =>
                      setRevenueValue("marginPercent", value)
                    }
                    min={0}
                    max={100}
                    ariaLabel={tr("margin")}
                    className="w-28"
                  />
                  <span className="w-6 font-mono text-xs text-ink-faint">
                    %
                  </span>
                </span>
              </div>
              <p className="mt-1 text-xs leading-snug text-ink-faint">
                {tr("marginHint")}
              </p>
            </div>
          </SectionCard>
        </div>

        {/* Живі результати з дефолтів — як на публічній сторінці */}
        <div className="lg:sticky lg:top-6">
          <ResultsPanel result={result} onReset={onReset} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard title={tc("costStructure")}>
            <CostStructureChart monthly={defaults.monthly} />
          </ChartCard>
          <ChartCard title={tc("incomeVsCosts")}>
            <IncomeVsCostsChart result={result} />
          </ChartCard>
        </div>
        <ChartCard title={tc("cumulativeProfit")}>
          <CumulativeProfitChart
            series={cumulativeSeries}
            paybackMonths={result.paybackMonths}
          />
        </ChartCard>
      </div>
    </div>
  );
}

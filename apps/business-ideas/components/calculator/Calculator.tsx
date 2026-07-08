"use client";

import { useTranslations } from "next-intl";

import { NumberField } from "@/components/calculator/NumberField";
import { ResultsPanel } from "@/components/calculator/ResultsPanel";
import { RevenueSection } from "@/components/calculator/RevenueSection";
import { ScenarioBar } from "@/components/calculator/ScenarioBar";
import { ScenarioCompare } from "@/components/calculator/ScenarioCompare";
import { SectionCard } from "@/components/calculator/SectionCard";
import { CostStructureChart } from "@/components/charts/CostStructureChart";
import { CumulativeProfitChart } from "@/components/charts/CumulativeProfitChart";
import { IncomeVsCostsChart } from "@/components/charts/IncomeVsCostsChart";
import { MONTHLY_FIELD_KEYS, STARTUP_FIELD_KEYS } from "@/lib/fieldConfig";
import { useCalculator } from "@/lib/hooks/useCalculator";
import { useCurrency } from "@/lib/hooks/useCurrency";
import type { Business } from "@/lib/types";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-card p-4 shadow-hard">
      <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function Calculator({ business }: { business: Business }) {
  const {
    inputs,
    result,
    cumulativeSeries,
    scenarios,
    activeId,
    canAddScenario,
    setActive,
    addScenario,
    removeScenario,
    setStartupField,
    setMonthlyField,
    setRevenueField,
    reset,
  } = useCalculator(business);
  const { money } = useCurrency();
  const t = useTranslations("calculator");
  const tf = useTranslations("fields");
  const th = useTranslations("fieldHints");
  const tc = useTranslations("charts");

  return (
    <div className="flex flex-col gap-6">
      <p className="border-l-2 border-amber bg-amber/10 px-3 py-2 text-xs leading-relaxed text-ink-soft">
        {t("disclaimer")}
      </p>

      {/* Сценарії: кілька варіантів розрахунку одного бізнесу */}
      <ScenarioBar
        scenarios={scenarios}
        activeId={activeId}
        canAdd={canAddScenario}
        onSelect={setActive}
        onAdd={addScenario}
        onRemove={removeScenario}
      />

      {/* Вхідні дані + липка панель результату */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          <SectionCard
            index="01"
            title={t("startupTitle")}
            totalLabel={t("totalLabel")}
            totalValue={money(result.startupTotal)}
          >
            {STARTUP_FIELD_KEYS.map((key) => {
              const override = business.fieldOverrides?.startup?.[key];
              return (
                <NumberField
                  key={key}
                  label={override?.label ?? tf(`startup.${key}`)}
                  hint={override?.hint ?? th(`startup.${key}`)}
                  value={inputs.startup[key]}
                  onChange={(value) => setStartupField(key, value)}
                />
              );
            })}
          </SectionCard>

          <SectionCard
            index="02"
            title={t("monthlyTitle")}
            totalLabel={t("totalMonthlyLabel")}
            totalValue={money(result.monthlyCostsTotal)}
          >
            {MONTHLY_FIELD_KEYS.map((key) => {
              const override = business.fieldOverrides?.monthly?.[key];
              return (
                <NumberField
                  key={key}
                  label={override?.label ?? tf(`monthly.${key}`)}
                  hint={override?.hint ?? th(`monthly.${key}`)}
                  value={inputs.monthly[key]}
                  onChange={(value) => setMonthlyField(key, value)}
                />
              );
            })}
          </SectionCard>

          <RevenueSection
            business={business}
            revenue={inputs.revenue}
            monthlyRevenue={result.monthlyRevenue}
            onChange={setRevenueField}
          />
        </div>

        {/* Результати — липнуть на десктопі */}
        <div className="lg:sticky lg:top-6">
          <ResultsPanel result={result} onReset={reset} />
        </div>
      </div>

      {/* Порівняння сценаріїв — з'являється, щойно їх стає два і більше */}
      <ScenarioCompare
        scenarios={scenarios}
        activeId={activeId}
        onSelect={setActive}
      />

      {/* Графіки — окремий блок під сіткою, тож липка панель їх не перекриває */}
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard title={tc("costStructure")}>
            <CostStructureChart monthly={inputs.monthly} />
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

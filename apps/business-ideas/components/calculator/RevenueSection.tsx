"use client";

import { useTranslations } from "next-intl";

import { MarginField } from "@/components/calculator/MarginField";
import { SectionCard } from "@/components/calculator/SectionCard";
import { SliderField } from "@/components/calculator/SliderField";
import { sliderMax } from "@/lib/fieldConfig";
import { useCurrency } from "@/lib/hooks/useCurrency";
import type { Business, RevenueInputs } from "@/lib/types";

interface RevenueSectionProps {
  business: Business;
  revenue: RevenueInputs;
  monthlyRevenue: number;
  onChange: (field: keyof RevenueInputs, value: number) => void;
}

export function RevenueSection({
  business,
  revenue,
  monthlyRevenue,
  onChange,
}: RevenueSectionProps) {
  const defaults = business.defaults.revenue;
  const labels = business.revenueLabels;
  const { money } = useCurrency();
  const t = useTranslations("revenue");
  const tc = useTranslations("calculator");

  return (
    <SectionCard
      index="03"
      title={tc("revenueTitle")}
      totalLabel={tc("revenueTotalLabel")}
      totalValue={money(monthlyRevenue)}
    >
      <SliderField
        label={labels?.clientsPerDay ?? t("clientsPerDay")}
        value={revenue.clientsPerDay}
        onChange={(value) => onChange("clientsPerDay", value)}
        min={0}
        max={sliderMax(defaults.clientsPerDay)}
      />
      <SliderField
        label={labels?.averageCheck ?? t("averageCheck")}
        value={revenue.averageCheck}
        onChange={(value) => onChange("averageCheck", value)}
        min={0}
        max={sliderMax(defaults.averageCheck)}
        money
      />
      <SliderField
        label={t("workDays")}
        value={revenue.workDaysPerMonth}
        onChange={(value) => onChange("workDaysPerMonth", value)}
        min={1}
        max={31}
      />
      <MarginField
        marginPercent={revenue.marginPercent}
        averageCheck={revenue.averageCheck}
        onChange={(value) => onChange("marginPercent", value)}
      />
    </SectionCard>
  );
}

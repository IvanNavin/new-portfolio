"use client";

import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CHART_COLORS,
  CHART_TOOLTIP_STYLE,
} from "@/components/charts/chartTheme";
import { useCurrency } from "@/lib/hooks/useCurrency";
import type { CalculationResult } from "@/lib/types";

interface IncomeVsCostsChartProps {
  result: CalculationResult;
}

/** Співвідношення обороту, валового прибутку, витрат і чистого прибутку */
export function IncomeVsCostsChart({ result }: IncomeVsCostsChartProps) {
  const { money, moneyCompact } = useCurrency();
  const t = useTranslations("charts");
  const data = [
    {
      name: t("barRevenue"),
      value: result.monthlyRevenue,
      color: CHART_COLORS.accent,
    },
    {
      name: t("barGross"),
      value: result.grossProfit,
      color: CHART_COLORS.lime,
    },
    {
      name: t("barCosts"),
      value: result.monthlyCostsTotal,
      color: CHART_COLORS.amber,
    },
    {
      name: t("barNet"),
      value: result.netProfit,
      color:
        result.netProfit >= 0 ? CHART_COLORS.accentDeep : CHART_COLORS.loss,
    },
  ];

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: CHART_COLORS.inkSoft }}
            axisLine={{ stroke: CHART_COLORS.ink }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value: number) => moneyCompact(value)}
            tick={{ fontSize: 11, fill: CHART_COLORS.inkFaint }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            formatter={(value) => money(Number(value))}
            contentStyle={CHART_TOOLTIP_STYLE}
            cursor={{ fill: "rgba(26, 34, 28, 0.06)" }}
          />
          <Bar
            dataKey="value"
            name="Сума"
            stroke={CHART_COLORS.ink}
            strokeWidth={1.5}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

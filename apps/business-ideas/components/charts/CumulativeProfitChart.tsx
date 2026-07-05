"use client";

import { useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
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
import type { CumulativeProfitPoint } from "@/lib/types";

interface CumulativeProfitChartProps {
  series: CumulativeProfitPoint[];
  paybackMonths: number | null;
}

/** Накопичений прибуток по місяцях з позначкою моменту окупності */
export function CumulativeProfitChart({
  series,
  paybackMonths,
}: CumulativeProfitChartProps) {
  const { money, moneyCompact } = useCurrency();
  const t = useTranslations("charts");
  const maxMonth = series[series.length - 1]?.month ?? 0;
  const showPayback = paybackMonths !== null && paybackMonths <= maxMonth;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={series}
          margin={{ top: 12, right: 16, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="cumulativeFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={CHART_COLORS.accent}
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor={CHART_COLORS.accent}
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_COLORS.line} vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={(month: number) => t("monthAxis", { month })}
            tick={{ fontSize: 11, fill: CHART_COLORS.inkFaint }}
            axisLine={{ stroke: CHART_COLORS.ink }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value: number) => moneyCompact(value)}
            tick={{ fontSize: 11, fill: CHART_COLORS.inkFaint }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            formatter={(value) => [money(Number(value)), t("accumulated")]}
            labelFormatter={(month) => t("monthLabel", { month })}
            contentStyle={CHART_TOOLTIP_STYLE}
          />
          <ReferenceLine y={0} stroke={CHART_COLORS.ink} strokeWidth={1.5} />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={CHART_COLORS.accent}
            strokeWidth={2.5}
            fill="url(#cumulativeFill)"
            isAnimationActive={false}
          />
          {showPayback ? (
            <ReferenceDot
              x={Math.round(paybackMonths)}
              y={0}
              r={6}
              fill={CHART_COLORS.lime}
              stroke={CHART_COLORS.ink}
              strokeWidth={2}
              label={{
                value: t("paybackMark", { months: Math.round(paybackMonths) }),
                position: "top",
                fill: CHART_COLORS.ink,
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

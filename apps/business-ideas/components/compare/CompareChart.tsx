"use client";

import {
  Bar,
  BarChart,
  Cell,
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

export interface CompareChartItem {
  name: string;
  netProfit: number;
}

/** Порівняння чистого прибутку між обраними бізнесами */
export function CompareChart({ items }: { items: CompareChartItem[] }) {
  const { money, moneyCompact } = useCurrency();

  return (
    <div style={{ height: Math.max(150, items.length * 54) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={items}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
        >
          <XAxis
            type="number"
            tickFormatter={(value: number) => moneyCompact(value)}
            tick={{ fontSize: 11, fill: CHART_COLORS.inkFaint }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={116}
            tick={{ fontSize: 12, fill: CHART_COLORS.inkSoft }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine x={0} stroke={CHART_COLORS.ink} strokeWidth={1.5} />
          <Tooltip
            formatter={(value) => money(Number(value))}
            contentStyle={CHART_TOOLTIP_STYLE}
            cursor={{ fill: "rgba(26, 34, 28, 0.06)" }}
          />
          <Bar
            dataKey="netProfit"
            stroke={CHART_COLORS.ink}
            strokeWidth={1.5}
            isAnimationActive={false}
          >
            {items.map((item) => (
              <Cell
                key={item.name}
                fill={
                  item.netProfit >= 0 ? CHART_COLORS.accent : CHART_COLORS.loss
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

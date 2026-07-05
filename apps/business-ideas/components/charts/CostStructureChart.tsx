"use client";

import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import {
  CHART_TOOLTIP_STYLE,
  PIE_PALETTE,
} from "@/components/charts/chartTheme";
import { MONTHLY_FIELD_KEYS } from "@/lib/fieldConfig";
import { useCurrency } from "@/lib/hooks/useCurrency";
import type { MonthlyCosts } from "@/lib/types";

interface CostStructureChartProps {
  monthly: MonthlyCosts;
}

/** Донат структури щомісячних витрат із легендою */
export function CostStructureChart({ monthly }: CostStructureChartProps) {
  const { money } = useCurrency();
  const tf = useTranslations("fields");
  const tc = useTranslations("charts");

  const data = MONTHLY_FIELD_KEYS.map((key) => ({
    name: tf(`monthly.${key}`),
    value: monthly[key],
  })).filter((entry) => entry.value > 0);

  if (data.length === 0) {
    return (
      <p className="flex h-56 items-center justify-center text-sm text-ink-faint">
        {tc("costStructureEmpty")}
      </p>
    );
  }

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="#1a221c"
              strokeWidth={1.5}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={PIE_PALETTE[index % PIE_PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => money(Number(value))}
              contentStyle={CHART_TOOLTIP_STYLE}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2">
        {data.map((entry, index) => (
          <li key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 border border-line"
              style={{ background: PIE_PALETTE[index % PIE_PALETTE.length] }}
            />
            <span className="truncate text-ink-soft">{entry.name}</span>
            <span className="ml-auto font-mono tabular-nums text-ink-faint">
              {Math.round((entry.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

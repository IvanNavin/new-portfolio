"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { StepperField } from "@/components/calculator/StepperField";

interface MarginFieldProps {
  marginPercent: number;
  /** Середній чек у гривнях — щоб перерахувати собівартість ↔ маржу */
  averageCheck: number;
  onChange: (marginPercent: number) => void;
}

type Mode = "margin" | "cost";

export function MarginField({
  marginPercent,
  averageCheck,
  onChange,
}: MarginFieldProps) {
  const t = useTranslations("revenue");
  const [mode, setMode] = useState<Mode>("margin");

  // Собівартість одиниці (грн), виведена з маржі при поточному чеку
  const costUah = Math.max(
    0,
    Math.round(averageCheck * (1 - marginPercent / 100) * 100) / 100,
  );

  const setFromCost = (newCostUah: number) => {
    const margin =
      averageCheck > 0 ? ((averageCheck - newCostUah) / averageCheck) * 100 : 0;
    onChange(Math.min(100, Math.max(0, Math.round(margin * 10) / 10)));
  };

  const tab = (active: boolean) =>
    `px-3 py-1 transition-colors ${
      active
        ? "bg-accent text-[color:var(--color-on-accent)]"
        : "text-ink-soft hover:text-ink"
    }`;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 pt-2">
        <span className="text-xs uppercase tracking-wider text-ink-faint">
          {t("marginMode")}
        </span>
        <div className="flex overflow-hidden rounded-full border border-line text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode("margin")}
            aria-pressed={mode === "margin"}
            className={tab(mode === "margin")}
          >
            {t("modeMargin")}
          </button>
          <button
            type="button"
            onClick={() => setMode("cost")}
            aria-pressed={mode === "cost"}
            className={tab(mode === "cost")}
          >
            {t("modeCost")}
          </button>
        </div>
      </div>

      {mode === "margin" ? (
        <StepperField
          key="margin"
          label={t("margin")}
          value={marginPercent}
          onChange={onChange}
          step={1}
          min={0}
          max={100}
          suffix="%"
          hint={t("marginHint")}
        />
      ) : (
        <StepperField
          key="cost"
          label={t("costLabel")}
          value={costUah}
          onChange={setFromCost}
          min={0}
          money
          hint={t("costHint")}
        />
      )}
    </div>
  );
}

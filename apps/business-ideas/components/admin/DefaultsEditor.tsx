"use client";

import { MONTHLY_FIELD_KEYS, STARTUP_FIELD_KEYS } from "@/lib/fieldConfig";
import type {
  CalculatorInputs,
  FieldOverride,
  FieldOverrides,
  MonthlyCosts,
  RevenueFieldLabels,
  StartupCosts,
} from "@/lib/types";

const LABELS: Record<string, string> = {
  equipment: "Обладнання",
  renovation: "Ремонт / підготовка",
  furniture: "Меблі",
  initialStock: "Стартова закупівля",
  licenses: "Ліцензії",
  marketing: "Реклама",
  other: "Інші витрати",
  rent: "Оренда",
  salaries: "Зарплати",
  utilities: "Комуналка",
  accounting: "Бухгалтерія",
  software: "ПЗ",
  clientsPerDay: "Клієнтів за день",
  averageCheck: "Середній чек",
  workDaysPerMonth: "Робочих днів/міс",
  marginPercent: "Маржа %",
};

const REVENUE_KEYS = [
  "clientsPerDay",
  "averageCheck",
  "workDaysPerMonth",
  "marginPercent",
] as const;

const inputCls =
  "w-full rounded-lg border border-line bg-inset px-3 py-2 text-sm focus:border-accent focus:outline-none";
const smallLabel = "text-xs uppercase tracking-wider text-ink-faint";

interface DefaultsEditorProps {
  defaults: CalculatorInputs;
  onDefaultsChange: (defaults: CalculatorInputs) => void;
  /** fieldOverrides + revenueLabels поточної мови (вкладки) */
  overrides: FieldOverrides | undefined;
  onOverridesChange: (overrides: FieldOverrides) => void;
  revenueLabels: RevenueFieldLabels | undefined;
  onRevenueLabelsChange: (labels: RevenueFieldLabels) => void;
}

export function DefaultsEditor({
  defaults,
  onDefaultsChange,
  overrides,
  onOverridesChange,
  revenueLabels,
  onRevenueLabelsChange,
}: DefaultsEditorProps) {
  const setStartup = (key: keyof StartupCosts, value: number) =>
    onDefaultsChange({
      ...defaults,
      startup: { ...defaults.startup, [key]: value },
    });
  const setMonthly = (key: keyof MonthlyCosts, value: number) =>
    onDefaultsChange({
      ...defaults,
      monthly: { ...defaults.monthly, [key]: value },
    });
  const setRevenue = (key: (typeof REVENUE_KEYS)[number], value: number) =>
    onDefaultsChange({
      ...defaults,
      revenue: { ...defaults.revenue, [key]: value },
    });

  const setOverride = (
    section: "startup" | "monthly",
    key: string,
    field: keyof FieldOverride,
    value: string,
  ) => {
    const base: FieldOverrides = overrides ?? {};
    const sec = { ...((base[section] ?? {}) as Record<string, FieldOverride>) };
    const entry: FieldOverride = {
      ...(sec[key] ?? {}),
      [field]: value || undefined,
    };
    if (!entry.label && !entry.hint) delete sec[key];
    else sec[key] = entry;
    onOverridesChange({ ...base, [section]: sec });
  };

  const setRevLabel = (key: keyof RevenueFieldLabels, value: string) =>
    onRevenueLabelsChange({
      ...(revenueLabels ?? {}),
      [key]: value || undefined,
    });

  return (
    <div className="flex flex-col gap-3">
      <details open className="rounded-xl border border-line p-4">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide">
          Дефолти калькулятора (у гривнях)
        </summary>
        <div className="mt-4 flex flex-col gap-4">
          <p className={smallLabel}>Стартові вкладення</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {STARTUP_FIELD_KEYS.map((key) => (
              <label key={key} className="flex flex-col gap-1">
                <span className={smallLabel}>{LABELS[key] ?? key}</span>
                <input
                  type="number"
                  value={defaults.startup[key]}
                  onChange={(e) => setStartup(key, Number(e.target.value))}
                  className={inputCls}
                />
              </label>
            ))}
          </div>
          <p className={smallLabel}>Щомісячні витрати</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {MONTHLY_FIELD_KEYS.map((key) => (
              <label key={key} className="flex flex-col gap-1">
                <span className={smallLabel}>{LABELS[key] ?? key}</span>
                <input
                  type="number"
                  value={defaults.monthly[key]}
                  onChange={(e) => setMonthly(key, Number(e.target.value))}
                  className={inputCls}
                />
              </label>
            ))}
          </div>
          <p className={smallLabel}>Доходи</p>
          <div className="grid gap-3 sm:grid-cols-4">
            {REVENUE_KEYS.map((key) => (
              <label key={key} className="flex flex-col gap-1">
                <span className={smallLabel}>{LABELS[key] ?? key}</span>
                <input
                  type="number"
                  value={defaults.revenue[key]}
                  onChange={(e) => setRevenue(key, Number(e.target.value))}
                  className={inputCls}
                />
              </label>
            ))}
          </div>
        </div>
      </details>

      <details className="rounded-xl border border-line p-4">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide">
          Підписи й підказки полів (для цієї мови)
        </summary>
        <p className="mt-2 text-xs text-ink-faint">
          Порожнє поле = стандартний підпис. Заповнюй лише де треба інакше.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <p className={smallLabel}>Стартові вкладення</p>
          {STARTUP_FIELD_KEYS.map((key) => (
            <div key={key} className="grid gap-2 sm:grid-cols-[120px_1fr_1fr]">
              <span className="self-center text-sm text-ink-soft">
                {LABELS[key] ?? key}
              </span>
              <input
                placeholder="Своя назва"
                value={overrides?.startup?.[key]?.label ?? ""}
                onChange={(e) =>
                  setOverride("startup", key, "label", e.target.value)
                }
                className={inputCls}
              />
              <input
                placeholder="Підказка"
                value={overrides?.startup?.[key]?.hint ?? ""}
                onChange={(e) =>
                  setOverride("startup", key, "hint", e.target.value)
                }
                className={inputCls}
              />
            </div>
          ))}
          <p className={smallLabel}>Щомісячні витрати</p>
          {MONTHLY_FIELD_KEYS.map((key) => (
            <div key={key} className="grid gap-2 sm:grid-cols-[120px_1fr_1fr]">
              <span className="self-center text-sm text-ink-soft">
                {LABELS[key] ?? key}
              </span>
              <input
                placeholder="Своя назва"
                value={overrides?.monthly?.[key]?.label ?? ""}
                onChange={(e) =>
                  setOverride("monthly", key, "label", e.target.value)
                }
                className={inputCls}
              />
              <input
                placeholder="Підказка"
                value={overrides?.monthly?.[key]?.hint ?? ""}
                onChange={(e) =>
                  setOverride("monthly", key, "hint", e.target.value)
                }
                className={inputCls}
              />
            </div>
          ))}
          <p className={smallLabel}>Підписи полів доходу</p>
          <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
            <span className="self-center text-sm text-ink-soft">
              Клієнтів/день
            </span>
            <input
              placeholder="Напр. Замовлень за день"
              value={revenueLabels?.clientsPerDay ?? ""}
              onChange={(e) => setRevLabel("clientsPerDay", e.target.value)}
              className={inputCls}
            />
            <span className="self-center text-sm text-ink-soft">
              Середній чек
            </span>
            <input
              placeholder="Напр. Місячна підписка (₴)"
              value={revenueLabels?.averageCheck ?? ""}
              onChange={(e) => setRevLabel("averageCheck", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </details>
    </div>
  );
}

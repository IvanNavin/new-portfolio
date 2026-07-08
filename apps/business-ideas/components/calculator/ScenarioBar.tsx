"use client";

import { useTranslations } from "next-intl";

import type { Scenario } from "@/lib/store";

interface ScenarioBarProps {
  scenarios: Scenario[];
  activeId: string;
  canAdd: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

/** Перемикач сценаріїв над калькулятором: «Варіант 1 / 2 / … / + Варіант» */
export function ScenarioBar({
  scenarios,
  activeId,
  canAdd,
  onSelect,
  onAdd,
  onRemove,
}: ScenarioBarProps) {
  const t = useTranslations("scenarios");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs uppercase tracking-wider text-ink-faint">
        {t("title")}
      </span>
      {scenarios.map((scenario, index) => {
        const active = scenario.id === activeId;
        return (
          <span
            key={scenario.id}
            className={`flex items-center overflow-hidden rounded-full border text-sm font-semibold transition-colors ${
              active
                ? "border-accent bg-accent text-[color:var(--color-on-accent)]"
                : "border-line bg-card text-ink-soft hover:bg-accent-soft"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(scenario.id)}
              aria-pressed={active}
              className="px-3 py-1.5"
            >
              {t("variant", { n: index + 1 })}
            </button>
            {scenarios.length > 1 ? (
              <button
                type="button"
                onClick={() => onRemove(scenario.id)}
                aria-label={t("remove", { n: index + 1 })}
                title={t("remove", { n: index + 1 })}
                className={`-ml-1 pr-2.5 text-xs leading-none transition-opacity ${
                  active
                    ? "opacity-70 hover:opacity-100"
                    : "opacity-50 hover:opacity-100 hover:text-loss"
                }`}
              >
                ✕
              </button>
            ) : null}
          </span>
        );
      })}
      {canAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full border border-dashed border-line bg-card px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          {t("add")}
        </button>
      ) : null}
    </div>
  );
}

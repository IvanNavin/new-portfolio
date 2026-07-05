"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { ScalesIcon } from "@/components/ui/ScalesIcon";
import { MAX_COMPARE, useCompareStore } from "@/lib/compareStore";

interface CompareToggleProps {
  slug: string;
  /** icon — квадратна іконка (картки); button — іконка з підписом (калькулятор) */
  variant?: "icon" | "button";
}

export function CompareToggle({ slug, variant = "icon" }: CompareToggleProps) {
  const t = useTranslations("compare");
  const selected = useCompareStore((state) => state.selected);
  const toggle = useCompareStore((state) => state.toggle);
  const hydrate = useCompareStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const active = selected.includes(slug);
  const disabled = !active && selected.length >= MAX_COMPARE;
  const label = active ? t("inCompare") : t("addToCompare");

  const state = active
    ? "bg-accent text-[color:var(--color-on-accent)]"
    : disabled
      ? "cursor-not-allowed bg-card text-ink-faint opacity-50"
      : "bg-card text-ink-soft hover:bg-accent-soft hover:text-ink";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={() => toggle(slug)}
        disabled={disabled}
        aria-pressed={active}
        title={label}
        className={`inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-hard-sm transition-colors ${state}`}
      >
        <ScalesIcon className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-line transition-colors ${state}`}
    >
      <ScalesIcon className="h-4 w-4" />
    </button>
  );
}

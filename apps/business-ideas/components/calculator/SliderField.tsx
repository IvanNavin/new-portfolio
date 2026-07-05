"use client";

import { useState } from "react";

import { useCurrency } from "@/lib/hooks/useCurrency";

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  /** Значення — грошова сума в гривнях: показувати й вводити в обраній валюті */
  money?: boolean;
  /** Пояснювальний підпис під повзунком */
  hint?: string;
}

/** Повзунок у парі з числовим полем — для «живих» параметрів доходу */
export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  money = false,
  hint,
}: SliderFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const { toDisplay, toBase, currency } = useCurrency();

  // Грошові значення показуємо в обраній валюті, решту — як є
  const displayValue = money ? Math.round(toDisplay(value)) : value;
  const displayMin = money ? Math.round(toDisplay(min)) : min;
  const displayMax = money
    ? Math.max(displayMin + 1, Math.round(toDisplay(max)))
    : max;
  // Повзунок тягнеться за введеним значенням — жодної «стелі», можна вписати тисячі
  const rangeMax = Math.max(displayMax, displayValue);
  const shownSuffix = money ? currency.symbol : suffix;

  const emit = (displayNumber: number) => {
    const clamped = Math.max(displayMin, displayNumber);
    onChange(money ? Math.round(toBase(clamped)) : clamped);
  };

  return (
    <div className="py-3">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm text-ink-soft">{label}</span>
        <span className="flex items-center gap-1.5">
          <input
            type="number"
            inputMode="numeric"
            min={displayMin}
            value={draft ?? displayValue}
            onFocus={() => setDraft(String(displayValue))}
            onBlur={() => setDraft(null)}
            onChange={(event) => {
              setDraft(event.target.value);
              const parsed = Number(event.target.value);
              if (Number.isFinite(parsed)) emit(parsed);
            }}
            className="w-24 border border-line bg-card px-2 py-1 text-right font-mono text-sm tabular-nums transition-colors focus:border-accent focus:bg-inset focus:outline-none"
          />
          {shownSuffix ? (
            <span className="font-mono text-xs text-ink-faint">
              {shownSuffix}
            </span>
          ) : null}
        </span>
      </div>
      <input
        type="range"
        min={displayMin}
        max={rangeMax}
        step={step}
        value={displayValue}
        onChange={(event) => emit(Number(event.target.value))}
        aria-label={label}
      />
      {hint ? (
        <p className="mt-1.5 text-xs leading-snug text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

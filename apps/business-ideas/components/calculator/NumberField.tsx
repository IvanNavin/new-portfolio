"use client";

import { useState } from "react";

import { useCurrency } from "@/lib/hooks/useCurrency";

interface NumberFieldProps {
  label: string;
  /** Значення в гривнях (базова валюта даних) */
  value: number;
  /** Повертає значення в гривнях */
  onChange: (value: number) => void;
  /** Пояснення, що входить у це поле */
  hint?: string;
}

/**
 * Числове поле сум. Значення зберігається в гривнях, а показується й
 * редагується в обраній валюті. Поки користувач друкує, тримаємо «чернетку»,
 * а в стор летить уже сконвертоване число — результати оновлюються миттєво.
 */
export function NumberField({
  label,
  value,
  onChange,
  hint,
}: NumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const { toDisplay, toBase, currency } = useCurrency();

  // Дозволяємо до 2 знаків після коми (напр. дрібні суми в іншій валюті)
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const displayValue = round2(toDisplay(value));

  return (
    <label className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
      <span className="text-sm text-ink-soft">
        {label}
        {hint ? (
          <span
            className="ml-1 cursor-help align-middle text-xs text-ink-faint"
            title={hint}
            aria-label={hint}
          >
            ⓘ
          </span>
        ) : null}
      </span>
      <span className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min={0}
          value={draft ?? displayValue}
          onFocus={() => setDraft(String(displayValue))}
          onBlur={() => setDraft(null)}
          onChange={(event) => {
            setDraft(event.target.value);
            const parsed = Number(event.target.value);
            if (Number.isFinite(parsed)) {
              onChange(Math.max(0, round2(toBase(parsed))));
            }
          }}
          className="w-28 border border-line bg-card px-2 py-1 text-right font-mono text-sm tabular-nums transition-colors focus:border-accent focus:bg-inset focus:outline-none"
        />
        <span className="w-6 font-mono text-xs text-ink-faint">
          {currency.symbol}
        </span>
      </span>
    </label>
  );
}

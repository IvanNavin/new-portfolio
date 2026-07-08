"use client";

import { useState } from "react";

interface AdminNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Числовий інпут адмін-редактора: значення в гривнях «як є», без конвертації.
 * Чернетка на час фокуса дозволяє спокійно набирати дробові значення.
 */
export function AdminNumberInput({
  value,
  onChange,
  min = 0,
  max,
  className = "",
  ariaLabel,
}: AdminNumberInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <input
      type="number"
      inputMode="decimal"
      step="any"
      min={min}
      max={max}
      value={draft ?? value}
      aria-label={ariaLabel}
      onFocus={() => setDraft(String(value))}
      onBlur={() => setDraft(null)}
      onChange={(event) => {
        setDraft(event.target.value);
        const parsed = Number(event.target.value);
        if (!Number.isFinite(parsed)) return;
        let next = Math.max(min, parsed);
        if (max !== undefined) next = Math.min(max, next);
        onChange(Math.round(next * 100) / 100);
      }}
      className={`border border-line bg-card px-2 py-1 text-right font-mono text-sm tabular-nums transition-colors focus:border-accent focus:bg-inset focus:outline-none ${className}`}
    />
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

import { useCurrency } from "@/lib/hooks/useCurrency";

interface StepperFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Крок кнопок ± у видимих одиницях; без нього — авто від порядку числа */
  step?: number;
  /** Нижня межа у видимих одиницях (типово 0) */
  min?: number;
  /** Верхня межа — лише коли вона змістовна (%, дні), інакше без стелі */
  max?: number;
  /** Значення — сума в гривнях: показуємо й редагуємо в обраній валюті */
  money?: boolean;
  suffix?: string;
  /** Пояснення під полем */
  hint?: string;
  /** Підпис над полем (для панелей фільтрів), замість рядка label—поле */
  stacked?: boolean;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Авто-крок для грошей: ~десята частина порядку числа (110 → 10, 45 000 → 1000) */
function magnitudeStep(displayValue: number): number {
  const abs = Math.abs(displayValue);
  if (abs < 20) return 1;
  return 10 ** Math.max(1, Math.floor(Math.log10(abs)) - 1);
}

/**
 * Поле «мінус — значення — плюс»: заміна повзунків. Не обмежує зверху
 * (можна вписати будь-яке число, зокрема дробове як 1.5), кнопки ±
 * підтримують утримання для швидкої зміни.
 */
export function StepperField({
  label,
  value,
  onChange,
  step,
  min = 0,
  max,
  money = false,
  suffix,
  hint,
  stacked = false,
}: StepperFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const { toDisplay, toBase, currency } = useCurrency();
  const repeatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayValue = money ? round2(toDisplay(value)) : round2(value);
  const shownSuffix = money ? currency.symbol : suffix;

  const clamp = (n: number) => {
    let next = Math.max(min, n);
    if (max !== undefined) next = Math.min(max, next);
    return round2(next);
  };

  const emit = (displayNumber: number) => {
    const clamped = clamp(displayNumber);
    onChange(money ? round2(toBase(clamped)) : clamped);
  };

  const stepBy = (direction: 1 | -1) => {
    const delta = step ?? (money ? magnitudeStep(displayValue) : 1);
    setDraft(null);
    emit(displayValue + direction * delta);
  };

  // Утримання кнопки: перший крок одразу, далі — авто-повтор
  const startRepeat = (direction: 1 | -1) => {
    stepBy(direction);
    const tick = () => {
      stepBy(direction);
      repeatTimer.current = setTimeout(tick, 90);
    };
    repeatTimer.current = setTimeout(tick, 420);
  };

  const stopRepeat = () => {
    if (repeatTimer.current) {
      clearTimeout(repeatTimer.current);
      repeatTimer.current = null;
    }
  };

  useEffect(() => stopRepeat, []);

  const atMin = displayValue <= min;
  const atMax = max !== undefined && displayValue >= max;

  const button = (direction: 1 | -1, disabled: boolean, symbol: string) => (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={(event) => {
        // Лише основна кнопка/тап; фокус лишаємо полю
        if (event.button === 0) {
          event.preventDefault();
          startRepeat(direction);
        }
      }}
      onPointerUp={stopRepeat}
      onPointerLeave={stopRepeat}
      onPointerCancel={stopRepeat}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          stepBy(direction);
        }
      }}
      aria-label={`${label}: ${symbol}`}
      className="w-8 select-none self-stretch font-mono text-sm text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent-deep disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {symbol}
    </button>
  );

  const group = (
    <span className="flex items-center gap-1.5">
      <span className="flex items-stretch overflow-hidden rounded-lg border border-line bg-card transition-colors focus-within:border-accent">
        {button(-1, atMin, "−")}
        <input
          type="number"
          inputMode="decimal"
          step="any"
          min={min}
          max={max}
          value={draft ?? displayValue}
          onFocus={() => setDraft(String(displayValue))}
          onBlur={() => setDraft(null)}
          onChange={(event) => {
            setDraft(event.target.value);
            const parsed = Number(event.target.value);
            if (Number.isFinite(parsed)) emit(parsed);
          }}
          className="w-24 border-x border-line bg-card px-2 py-1.5 text-center font-mono text-sm tabular-nums focus:bg-inset focus:outline-none"
        />
        {button(1, atMax, "+")}
      </span>
      {shownSuffix ? (
        <span className="min-w-6 font-mono text-xs text-ink-faint">
          {shownSuffix}
        </span>
      ) : null}
    </span>
  );

  if (stacked) {
    return (
      <label className="flex flex-col gap-1.5">
        <span className="text-xs uppercase tracking-wider text-ink-faint">
          {label}
        </span>
        {group}
        {hint ? (
          <p className="text-xs leading-snug text-ink-faint">{hint}</p>
        ) : null}
      </label>
    );
  }

  return (
    <div className="py-2.5">
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm text-ink-soft">{label}</span>
        {group}
      </label>
      {hint ? (
        <p className="mt-1.5 text-xs leading-snug text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

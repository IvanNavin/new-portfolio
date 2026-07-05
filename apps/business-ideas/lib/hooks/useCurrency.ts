"use client";

import { useLocale } from "next-intl";

import type { Currency } from "@/lib/currency";
import { getCurrency } from "@/lib/currency";
import { useCurrencyStore } from "@/lib/currencyStore";
import {
  formatBudgetRange,
  formatMoney,
  formatMoneyCompact,
} from "@/lib/format";

export interface UseCurrencyResult {
  currency: Currency;
  /** Скільки гривень за 1 одиницю обраної валюти */
  rate: number;
  /** UAH → обрана валюта */
  toDisplay: (uah: number) => number;
  /** обрана валюта → UAH */
  toBase: (value: number) => number;
  /** Форматує суму, задану в гривнях, у поточній валюті */
  money: (uah: number) => string;
  moneyCompact: (uah: number) => string;
  budget: (minUah: number, maxUah: number) => string;
}

/**
 * Єдина точка конвертації та форматування грошей. Дані всюди в гривнях —
 * усі суми проходять через цей хук: конвертуються за курсом і форматуються
 * за локаллю інтерфейсу з символом обраної валюти.
 */
export function useCurrency(): UseCurrencyResult {
  const locale = useLocale();
  const code = useCurrencyStore((state) => state.code);
  const rates = useCurrencyStore((state) => state.rates);

  const currency = getCurrency(code);
  const rate = rates[code] ?? 1;

  const toDisplay = (uah: number) => uah / rate;
  const toBase = (value: number) => value * rate;

  return {
    currency,
    rate,
    toDisplay,
    toBase,
    money: (uah) => formatMoney(toDisplay(uah), locale, currency.symbol),
    moneyCompact: (uah) =>
      formatMoneyCompact(toDisplay(uah), locale, currency.symbol),
    budget: (minUah, maxUah) =>
      formatBudgetRange(
        toDisplay(minUah),
        toDisplay(maxUah),
        locale,
        currency.symbol,
      ),
  };
}

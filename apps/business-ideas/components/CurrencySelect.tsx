"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { CURRENCIES } from "@/lib/currency";
import { useCurrencyStore } from "@/lib/currencyStore";

export function CurrencySelect() {
  const t = useTranslations("currency");
  const code = useCurrencyStore((state) => state.code);
  const setCode = useCurrencyStore((state) => state.setCode);
  const loadRates = useCurrencyStore((state) => state.loadRates);

  useEffect(() => {
    const saved = window.localStorage.getItem("bi:currency");
    if (saved) setCode(saved);
    loadRates();
  }, [loadRates, setCode]);

  return (
    <label className="flex items-center gap-2">
      <span className="hidden font-mono text-[10px] uppercase tracking-widest text-ink-faint sm:inline">
        {t("label")}
      </span>
      <select
        value={code}
        onChange={(event) => setCode(event.target.value)}
        aria-label={t("label")}
        className="cursor-pointer rounded-lg border border-line bg-card px-2 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-ink shadow-hard-sm focus:outline-none"
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} {currency.symbol}
          </option>
        ))}
      </select>
    </label>
  );
}

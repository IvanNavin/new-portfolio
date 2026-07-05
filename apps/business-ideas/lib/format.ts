/**
 * Форматування чисел і грошей. Число форматується за локаллю інтерфейсу
 * (розділювачі, «тис./млн» vs «K/M»), а символ валюти додається окремо —
 * так мова UI й обрана валюта не заважають одна одній.
 */
const formatters = new Map<string, Intl.NumberFormat>();

function nf(locale: string, key: string, options: Intl.NumberFormatOptions) {
  const cacheKey = `${locale}:${key}`;
  let formatter = formatters.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatters.set(cacheKey, formatter);
  }
  return formatter;
}

export function formatMoney(
  value: number,
  locale: string,
  symbol: string,
): string {
  if (!Number.isFinite(value)) return "—";
  return `${nf(locale, "money", { maximumFractionDigits: 0 }).format(value)} ${symbol}`;
}

export function formatMoneyCompact(
  value: number,
  locale: string,
  symbol: string,
): string {
  if (!Number.isFinite(value)) return "—";
  const formatted = nf(locale, "compact", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
  return `${formatted} ${symbol}`;
}

export function formatBudgetRange(
  min: number,
  max: number,
  locale: string,
  symbol: string,
): string {
  const compact = nf(locale, "compact", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  return `${compact.format(min)} – ${compact.format(max)} ${symbol}`;
}

export function formatNumber(value: number, locale: string): string {
  if (!Number.isFinite(value)) return "—";
  return nf(locale, "number", { maximumFractionDigits: 1 }).format(value);
}

export function formatPercent(value: number, locale: string): string {
  if (!Number.isFinite(value)) return "—";
  return `${formatNumber(value, locale)}%`;
}

export type PaybackInfo =
  { kind: "never" } | { kind: "over" } | { kind: "months"; months: number };

/** Класифікує строк окупності — сам текст локалізується в компоненті */
export function classifyPayback(months: number | null): PaybackInfo {
  if (months === null || !Number.isFinite(months)) return { kind: "never" };
  if (months > 120) return { kind: "over" };
  return { kind: "months", months };
}

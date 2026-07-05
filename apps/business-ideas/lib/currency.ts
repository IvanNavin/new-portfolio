export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

/**
 * Базова валюта даних — гривня: усі значення в бізнес-даних зберігаються в UAH,
 * а на екран конвертуються за курсом обраної валюти.
 */
export const BASE_CURRENCY = "UAH";

export const CURRENCIES: Currency[] = [
  { code: "UAH", symbol: "₴", label: "Гривня" },
  { code: "USD", symbol: "$", label: "Долар США" },
  { code: "EUR", symbol: "€", label: "Євро" },
  { code: "GBP", symbol: "£", label: "Фунт" },
  { code: "PLN", symbol: "zł", label: "Злотий" },
];

/**
 * Запасні курси (скільки гривень за 1 одиницю валюти) на випадок, якщо
 * запит до НБУ не вдався — щоб застосунок працював навіть офлайн.
 * Орієнтовні станом на середину 2025 року.
 */
export const FALLBACK_RATES: Record<string, number> = {
  UAH: 1,
  USD: 41.5,
  EUR: 45,
  GBP: 53,
  PLN: 10.6,
};

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];
}

import type { MonthlyCosts, StartupCosts } from "@/lib/types";

/** Ключі полів; підписи беруться з i18n (namespace «fields») */
export const STARTUP_FIELD_KEYS: (keyof StartupCosts)[] = [
  "equipment",
  "renovation",
  "furniture",
  "initialStock",
  "licenses",
  "marketing",
  "other",
];

export const MONTHLY_FIELD_KEYS: (keyof MonthlyCosts)[] = [
  "rent",
  "salaries",
  "utilities",
  "marketing",
  "accounting",
  "software",
  "other",
];

/** Верхня межа повзунка: ~3 значення за замовчуванням, округлена до «гарного» числа */
export function sliderMax(defaultValue: number): number {
  const raw = Math.max(defaultValue * 3, 10);
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  return Math.ceil(raw / magnitude) * magnitude;
}

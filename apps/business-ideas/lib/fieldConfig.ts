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

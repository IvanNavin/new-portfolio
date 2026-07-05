/** Стартові (одноразові) вкладення, грн */
export interface StartupCosts {
  equipment: number;
  renovation: number;
  furniture: number;
  initialStock: number;
  licenses: number;
  marketing: number;
  other: number;
}

/** Щомісячні (постійні) витрати, грн */
export interface MonthlyCosts {
  rent: number;
  salaries: number;
  utilities: number;
  marketing: number;
  accounting: number;
  software: number;
  other: number;
}

/** Вхідні дані про доходи */
export interface RevenueInputs {
  /** Клієнтів (продажів) за день */
  clientsPerDay: number;
  /** Середній чек, грн */
  averageCheck: number;
  /** Робочих днів на місяць */
  workDaysPerMonth: number;
  /** Маржинальність, % (частка чека, що лишається після собівартості) */
  marginPercent: number;
}

/** Повний стан калькулятора для одного бізнесу */
export interface CalculatorInputs {
  startup: StartupCosts;
  monthly: MonthlyCosts;
  revenue: RevenueInputs;
}

/** Підписи полів доходу, якщо бізнес-модель нетипова (перегляди, підписки тощо) */
export interface RevenueFieldLabels {
  clientsPerDay?: string;
  averageCheck?: string;
}

export type BusinessCategory =
  "food" | "services" | "retail" | "digital" | "production";

export interface Business {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: BusinessCategory;
  /** Складність запуску, 1–5 */
  difficulty: number;
  /** Ризик, 1–5 */
  risk: number;
  /** Рекомендований стартовий бюджет, грн (від/до) */
  recommendedBudget: { min: number; max: number };
  pros: string[];
  cons: string[];
  defaults: CalculatorInputs;
  revenueLabels?: RevenueFieldLabels;
  /** Уточнення полів під конкретний бізнес (назва та/або підказка) */
  fieldOverrides?: FieldOverrides;
}

/** Перевизначення підпису/підказки поля для конкретного бізнесу */
export interface FieldOverride {
  label?: string;
  hint?: string;
}

export interface FieldOverrides {
  startup?: Partial<Record<keyof StartupCosts, FieldOverride>>;
  monthly?: Partial<Record<keyof MonthlyCosts, FieldOverride>>;
}

/** Результати автоматичних розрахунків */
export interface CalculationResult {
  startupTotal: number;
  monthlyCostsTotal: number;
  /** Місячний оборот */
  monthlyRevenue: number;
  /** Валовий прибуток (оборот × маржа) */
  grossProfit: number;
  /** Чистий прибуток (валовий − постійні витрати) */
  netProfit: number;
  /** Оборот, потрібний для виходу в нуль */
  breakEvenRevenue: number;
  /** Скільки клієнтів на день потрібно для беззбитковості */
  breakEvenClientsPerDay: number;
  /** Строк окупності в місяцях; null — не окупається */
  paybackMonths: number | null;
  /** Рентабельність продажів, % (чистий прибуток / оборот) */
  profitabilityPercent: number;
}

/** Точка графіка накопиченого прибутку */
export interface CumulativeProfitPoint {
  month: number;
  cumulative: number;
}

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { useAdmin } from "@/components/admin/AdminProvider";
import { StepperField } from "@/components/calculator/StepperField";
import { BusinessCard } from "@/components/home/BusinessCard";
import { Link } from "@/i18n/navigation";
import { calculate } from "@/lib/calculations";
import type { Business, BusinessCategory } from "@/lib/types";

const CATEGORY_ORDER: BusinessCategory[] = [
  "food",
  "services",
  "retail",
  "digital",
  "production",
];

type SortKey = "default" | "budget" | "budgetDesc" | "risk" | "profit";

const SORT_KEYS: SortKey[] = [
  "default",
  "budget",
  "budgetDesc",
  "risk",
  "profit",
];

const FILTERS_STORAGE_KEY = "bi:filters";

/** Збережені значення фільтрів — лише ті, що відрізняються від дефолтних */
interface StoredFilters {
  cats?: BusinessCategory[];
  minBudget?: number;
  maxBudget?: number;
  maxRisk?: number;
  maxDiff?: number;
  sort?: SortKey;
}

function parseIntOrUndef(raw: string | null): number | undefined {
  if (raw === null) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function parseLevel(raw: unknown): number | undefined {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : undefined;
}

/** Читає фільтри з URL (пріоритет) або з localStorage */
function readStoredFilters(): StoredFilters {
  const params = new URLSearchParams(window.location.search);
  const hasUrlFilters = ["cats", "bmin", "bmax", "risk", "diff", "sort"].some(
    (key) => params.has(key),
  );

  let raw: StoredFilters = {};
  if (hasUrlFilters) {
    raw = {
      cats: params.get("cats")?.split(",") as BusinessCategory[] | undefined,
      minBudget: parseIntOrUndef(params.get("bmin")),
      maxBudget: parseIntOrUndef(params.get("bmax")),
      maxRisk: parseLevel(params.get("risk")),
      maxDiff: parseLevel(params.get("diff")),
      sort: (params.get("sort") ?? undefined) as SortKey | undefined,
    };
  } else {
    try {
      raw = JSON.parse(
        window.localStorage.getItem(FILTERS_STORAGE_KEY) ?? "{}",
      ) as StoredFilters;
    } catch {
      raw = {};
    }
  }

  // Валідація: пропускаємо лише відомі значення
  return {
    cats: Array.isArray(raw.cats)
      ? raw.cats.filter((c) => CATEGORY_ORDER.includes(c))
      : undefined,
    minBudget:
      typeof raw.minBudget === "number" && raw.minBudget >= 0
        ? raw.minBudget
        : undefined,
    maxBudget:
      typeof raw.maxBudget === "number" && raw.maxBudget >= 0
        ? raw.maxBudget
        : undefined,
    maxRisk: parseLevel(raw.maxRisk),
    maxDiff: parseLevel(raw.maxDiff),
    sort:
      raw.sort && SORT_KEYS.includes(raw.sort) && raw.sort !== "default"
        ? raw.sort
        : undefined,
  };
}

function LevelPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs uppercase tracking-wider text-ink-faint">
        {label}
      </p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={n === value}
            className={`h-8 w-8 rounded-lg border border-line font-mono text-sm transition-colors ${
              n <= value
                ? "bg-accent text-[color:var(--color-on-accent)]"
                : "bg-card text-ink-soft hover:bg-accent-soft"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BusinessList({ businesses }: { businesses: Business[] }) {
  const t = useTranslations("filters");
  const tcat = useTranslations("categories");
  const { isAdmin } = useAdmin();

  const budgetBounds = useMemo(() => {
    const maxs = businesses.map((b) => b.recommendedBudget.max);
    return { min: 0, max: Math.max(...maxs) };
  }, [businesses]);

  const [cats, setCats] = useState<BusinessCategory[]>([]);
  const [minBudget, setMinBudget] = useState(budgetBounds.min);
  const [maxBudget, setMaxBudget] = useState(budgetBounds.max);
  const [maxRisk, setMaxRisk] = useState(5);
  const [maxDiff, setMaxDiff] = useState(5);
  const [sort, setSort] = useState<SortKey>("default");
  // Стаємо true після відновлення збережених фільтрів — до того не пишемо
  const [restored, setRestored] = useState(false);

  // Відновлення фільтрів: з URL (можна шарити лінк), інакше — з localStorage
  useEffect(() => {
    const stored = readStoredFilters();
    if (stored.cats?.length) setCats(stored.cats);
    if (stored.minBudget !== undefined) setMinBudget(stored.minBudget);
    if (stored.maxBudget !== undefined) setMaxBudget(stored.maxBudget);
    if (stored.maxRisk !== undefined) setMaxRisk(stored.maxRisk);
    if (stored.maxDiff !== undefined) setMaxDiff(stored.maxDiff);
    if (stored.sort !== undefined) setSort(stored.sort);
    setRestored(true);
  }, []);

  // Збереження: недефолтні значення — в URL і localStorage, дефолтні — прибираємо
  useEffect(() => {
    if (!restored) return;

    const filters: StoredFilters = {};
    if (cats.length > 0) filters.cats = cats;
    if (minBudget !== budgetBounds.min) filters.minBudget = minBudget;
    if (maxBudget !== budgetBounds.max) filters.maxBudget = maxBudget;
    if (maxRisk !== 5) filters.maxRisk = maxRisk;
    if (maxDiff !== 5) filters.maxDiff = maxDiff;
    if (sort !== "default") filters.sort = sort;

    try {
      if (Object.keys(filters).length > 0) {
        window.localStorage.setItem(
          FILTERS_STORAGE_KEY,
          JSON.stringify(filters),
        );
      } else {
        window.localStorage.removeItem(FILTERS_STORAGE_KEY);
      }
    } catch {
      // приватний режим — не критично, лишиться синхронізація через URL
    }

    const url = new URL(window.location.href);
    const setParam = (key: string, value: string | number | undefined) => {
      if (value === undefined) url.searchParams.delete(key);
      else url.searchParams.set(key, String(value));
    };
    setParam("cats", filters.cats?.join(","));
    setParam("bmin", filters.minBudget);
    setParam("bmax", filters.maxBudget);
    setParam("risk", filters.maxRisk);
    setParam("diff", filters.maxDiff);
    setParam("sort", filters.sort);
    window.history.replaceState(null, "", url);
  }, [
    restored,
    cats,
    minBudget,
    maxBudget,
    maxRisk,
    maxDiff,
    sort,
    budgetBounds,
  ]);

  const toggleCat = (c: BusinessCategory) =>
    setCats((cur) =>
      cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c],
    );

  const isDefault =
    cats.length === 0 &&
    minBudget === budgetBounds.min &&
    maxBudget === budgetBounds.max &&
    maxRisk === 5 &&
    maxDiff === 5 &&
    sort === "default";

  const reset = () => {
    setCats([]);
    setMinBudget(budgetBounds.min);
    setMaxBudget(budgetBounds.max);
    setMaxRisk(5);
    setMaxDiff(5);
    setSort("default");
  };

  const sorted = useMemo(() => {
    // бізнес підходить, якщо його бюджетний діапазон перетинається з обраним
    const filtered = businesses.filter(
      (b) =>
        (cats.length === 0 || cats.includes(b.category)) &&
        b.recommendedBudget.min <= maxBudget &&
        b.recommendedBudget.max >= minBudget &&
        b.risk <= maxRisk &&
        b.difficulty <= maxDiff,
    );
    if (sort === "budget") {
      filtered.sort(
        (a, b) => a.recommendedBudget.min - b.recommendedBudget.min,
      );
    } else if (sort === "budgetDesc") {
      filtered.sort(
        (a, b) => b.recommendedBudget.min - a.recommendedBudget.min,
      );
    } else if (sort === "risk") {
      filtered.sort((a, b) => a.risk - b.risk);
    } else if (sort === "profit") {
      filtered.sort(
        (a, b) =>
          calculate(b.defaults).netProfit - calculate(a.defaults).netProfit,
      );
    }
    return filtered;
  }, [businesses, cats, minBudget, maxBudget, maxRisk, maxDiff, sort]);

  return (
    <>
      {isAdmin ? (
        <Link
          href="/business/new"
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-on-accent)] transition-colors hover:bg-accent-deep"
        >
          + Створити бізнес
        </Link>
      ) : null}
      <div className="mb-8 rounded-2xl border border-line bg-card p-4 shadow-hard sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide">
            {t("title")}
          </h2>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ink-faint">
              {t("results", { count: sorted.length, total: businesses.length })}
            </span>
            {!isDefault ? (
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-line bg-card px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink-soft transition-colors hover:border-loss hover:text-loss"
              >
                {t("reset")}
              </button>
            ) : null}
          </div>
        </div>

        {/* Категорія */}
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((c) => {
            const active = cats.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCat(c)}
                aria-pressed={active}
                className={`rounded-full border border-line px-3 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-accent text-[color:var(--color-on-accent)]"
                    : "bg-card text-ink-soft hover:bg-paper"
                }`}
              >
                {tcat(c)}
              </button>
            );
          })}
        </div>

        <div className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
          <StepperField
            label={t("budgetFrom")}
            value={minBudget}
            onChange={(v) => setMinBudget(Math.min(v, maxBudget))}
            money
            stacked
          />
          <StepperField
            label={t("budgetTo")}
            value={maxBudget}
            onChange={(v) => setMaxBudget(Math.max(v, minBudget))}
            money
            stacked
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:items-end">
          <LevelPicker
            label={t("riskTo")}
            value={maxRisk}
            onChange={setMaxRisk}
          />
          <LevelPicker
            label={t("difficultyTo")}
            value={maxDiff}
            onChange={setMaxDiff}
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wider text-ink-faint">
              {t("sort")}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-8 cursor-pointer rounded-lg border border-line bg-card px-2 text-sm font-semibold focus:outline-none"
            >
              <option value="default">{t("sortDefault")}</option>
              <option value="budget">{t("sortBudget")}</option>
              <option value="budgetDesc">{t("sortBudgetDesc")}</option>
              <option value="risk">{t("sortRisk")}</option>
              <option value="profit">{t("sortProfit")}</option>
            </select>
          </label>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-16 text-center text-sm text-ink-faint">
          {t("empty")}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((business, index) => (
            <BusinessCard key={business.id} business={business} order={index} />
          ))}
        </div>
      )}
    </>
  );
}

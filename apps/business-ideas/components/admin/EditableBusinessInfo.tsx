"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { getBusinessForEdit, saveBusiness } from "@/app/actions/admin-content";
import { AdminCalculator } from "@/components/admin/AdminCalculator";
import { AdminNumberInput } from "@/components/admin/AdminNumberInput";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Calculator } from "@/components/calculator/Calculator";
import { LevelMeter } from "@/components/ui/LevelMeter";
import { BudgetRange } from "@/components/ui/Money";
import type { AdminBusiness, AdminLocale } from "@/lib/data/adminBusinesses";
import type { Business, BusinessCategory, CalculatorInputs } from "@/lib/types";

const CATEGORIES: BusinessCategory[] = [
  "food",
  "services",
  "retail",
  "digital",
  "production",
];

/** Стиль «редагованого тексту»: та сама типографіка + пунктир знизу */
const editableCls =
  "border-b border-dashed border-line bg-transparent transition-colors focus:border-accent focus:outline-none";

const EMPTY_DEFAULTS: CalculatorInputs = {
  startup: {
    equipment: 0,
    renovation: 0,
    furniture: 0,
    initialStock: 0,
    licenses: 0,
    marketing: 0,
    other: 0,
  },
  monthly: {
    rent: 0,
    salaries: 0,
    utilities: 0,
    marketing: 0,
    accounting: 0,
    software: 0,
    other: 0,
  },
  revenue: {
    clientsPerDay: 10,
    averageCheck: 100,
    workDaysPerMonth: 26,
    marginPercent: 50,
  },
};

function blankDraft(): AdminBusiness {
  const emptyContent = {
    name: "",
    shortDescription: "",
    description: "",
    pros: [] as string[],
    cons: [] as string[],
  };
  return {
    slug: "",
    category: "food",
    difficulty: 3,
    risk: 3,
    budgetMin: 0,
    budgetMax: 0,
    sortOrder: 999,
    defaults: EMPTY_DEFAULTS,
    content: { uk: { ...emptyContent }, en: { ...emptyContent } },
  };
}

interface DisplayData {
  category: BusinessCategory;
  difficulty: number;
  risk: number;
  budgetMin: number;
  budgetMax: number;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
}

function Stars({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-ink-faint">
        {label}
      </span>
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label}: ${n} з 5`}
            className="text-xl leading-none transition-transform hover:scale-110"
          >
            <span className={value >= n ? "text-amber" : "text-line"}>★</span>
          </button>
        ))}
      </span>
    </span>
  );
}

/** Список переваг/недоліків у вигляді сторінки, але кожен пункт — інпут */
function InlineListEditor({
  items,
  onChange,
  marker,
  addLabel,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  marker: "accent" | "loss";
  addLabel: string;
  placeholder: string;
}) {
  const markerCls = marker === "accent" ? "text-accent" : "text-loss";
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-ink-soft">
          <span className={markerCls}>▪</span>
          <input
            value={item}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onChange([...items, ""]);
            }}
            className={`flex-1 text-sm text-ink-soft ${editableCls}`}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Прибрати пункт"
            className="px-1 text-xs text-ink-faint transition-colors hover:text-loss"
          >
            ✕
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="mt-1 rounded-full border border-dashed border-line px-3 py-1 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          + {addLabel}
        </button>
      </li>
    </ul>
  );
}

export function EditableBusinessInfo({
  business,
  locale,
  isCreate = false,
}: {
  business?: Business;
  locale: string;
  isCreate?: boolean;
}) {
  const { isAdmin } = useAdmin();
  const t = useTranslations("business");
  const tm = useTranslations("meters");
  const tcat = useTranslations("categories");
  const router = useRouter();

  const [mode, setMode] = useState<"view" | "edit" | "preview">(
    isCreate ? "edit" : "view",
  );
  const [draft, setDraft] = useState<AdminBusiness | null>(
    isCreate ? blankDraft() : null,
  );
  /** Дефолти на момент відкриття редактора — для «Скинути» в результатах */
  const [initialDefaults, setInitialDefaults] =
    useState<CalculatorInputs>(EMPTY_DEFAULTS);
  const [tab, setTab] = useState<AdminLocale>(locale === "en" ? "en" : "uk");
  const [busy, setBusy] = useState(false);

  const enterEdit = async () => {
    if (!business) return;
    setBusy(true);
    const data = await getBusinessForEdit(business.slug);
    setBusy(false);
    if (data) {
      setDraft(data);
      setInitialDefaults(data.defaults);
      setMode("edit");
    }
  };

  const save = async () => {
    if (!draft) return;
    if (isCreate && !draft.slug.trim()) {
      window.alert("Вкажи slug (латиницею).");
      return;
    }
    setBusy(true);
    try {
      await saveBusiness({ ...draft, slug: draft.slug.trim() });
    } finally {
      setBusy(false);
    }
    if (isCreate) {
      router.push(`/${locale}/business/${draft.slug.trim()}`);
      return;
    }
    setMode("view");
    router.refresh();
  };

  const cancel = () => {
    if (isCreate) router.push(`/${locale}`);
    else setMode("view");
  };

  const patchBase = <K extends keyof AdminBusiness>(
    key: K,
    value: AdminBusiness[K],
  ) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  const patchContent = (field: string, value: unknown) =>
    setDraft((d) =>
      d
        ? {
            ...d,
            content: {
              ...d.content,
              [tab]: { ...d.content[tab], [field]: value },
            },
          }
        : d,
    );

  const chip = (cat: BusinessCategory) => (
    <span className="inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent-deep">
      {tcat(cat)}
    </span>
  );

  const calcHeading = (
    <h2 className="mb-5 font-display text-xl font-bold uppercase tracking-wide">
      {t("calculator")}
      <span className="ml-2 inline-block h-3 w-3 rounded-sm bg-accent" />
    </h2>
  );

  // ── EDIT: та сама сторінка, але все редагується на місці ──
  if (mode === "edit" && draft) {
    const c = draft.content[tab];
    const tabCls = (active: boolean) =>
      `px-3 py-1 text-xs font-semibold uppercase ${
        active
          ? "bg-accent text-[color:var(--color-on-accent)]"
          : "text-ink-soft hover:text-ink"
      }`;

    return (
      <>
        {/* Липка панель дій — завжди під рукою на довгій сторінці */}
        <div className="sticky top-2 z-40 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent bg-card px-4 py-2.5 shadow-hard">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-sm font-semibold uppercase tracking-wide">
              {isCreate ? "Новий бізнес" : "Редагування"}
            </span>
            <div className="flex overflow-hidden rounded-full border border-line">
              <button
                type="button"
                onClick={() => setTab("uk")}
                className={tabCls(tab === "uk")}
              >
                UA
              </button>
              <button
                type="button"
                onClick={() => setTab("en")}
                className={tabCls(tab === "en")}
              >
                EN
              </button>
            </div>
            {isCreate ? (
              <input
                value={draft.slug}
                onChange={(e) => patchBase("slug", e.target.value)}
                placeholder="slug (латиницею)"
                className={`w-44 font-mono text-sm ${editableCls}`}
              />
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("preview")}
              className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft transition-colors hover:text-ink"
            >
              Прев&apos;ю
            </button>
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-on-accent)] transition-colors hover:bg-accent-deep disabled:opacity-50"
            >
              {busy ? "…" : isCreate ? "Створити" : "Зберегти"}
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft transition-colors hover:text-ink"
            >
              Скасувати
            </button>
          </div>
        </div>

        {/* Картка бізнесу — лейаут сторінки, редагування на місці */}
        <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-hard">
          <div className="border-b border-line px-5 py-6 sm:px-8">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => patchBase("category", cat)}
                    aria-pressed={draft.category === cat}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                      draft.category === cat
                        ? "bg-accent text-[color:var(--color-on-accent)]"
                        : "bg-accent-soft text-accent-deep opacity-50 hover:opacity-100"
                    }`}
                  >
                    {tcat(cat)}
                  </button>
                ))}
              </span>
              <Stars
                label={tm("difficulty")}
                value={draft.difficulty}
                onChange={(n) => patchBase("difficulty", n)}
              />
              <Stars
                label={tm("risk")}
                value={draft.risk}
                onChange={(n) => patchBase("risk", n)}
              />
            </div>

            <input
              value={c.name}
              placeholder="Назва бізнесу…"
              onChange={(e) => patchContent("name", e.target.value)}
              className={`mt-4 w-full font-display text-3xl font-bold leading-tight sm:text-4xl ${editableCls}`}
            />
            <textarea
              value={c.description}
              placeholder="Опис бізнесу…"
              maxLength={5000}
              rows={3}
              onChange={(e) => patchContent("description", e.target.value)}
              className={`mt-3 block w-full max-w-2xl resize-y leading-relaxed text-ink-soft ${editableCls}`}
            />
            <input
              value={c.shortDescription}
              placeholder="Короткий опис — показується на картці на головній…"
              onChange={(e) => patchContent("shortDescription", e.target.value)}
              className={`mt-2 block w-full max-w-2xl text-sm text-ink-faint ${editableCls}`}
            />

            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-inset px-3 py-1.5 font-mono text-sm">
              <span className="text-ink-faint">{t("recommendedStart")}</span>
              <AdminNumberInput
                value={draft.budgetMin}
                onChange={(v) => patchBase("budgetMin", v)}
                ariaLabel="Бюджет від (₴)"
                className="w-24 rounded-md"
              />
              <span className="text-ink-faint">–</span>
              <AdminNumberInput
                value={draft.budgetMax}
                onChange={(v) => patchBase("budgetMax", v)}
                ariaLabel="Бюджет до (₴)"
                className="w-24 rounded-md"
              />
              <span className="text-ink-faint">₴</span>
            </p>
          </div>

          <div className="grid sm:grid-cols-2">
            <div className="border-b border-line px-5 py-4 sm:border-b-0 sm:border-r sm:px-8">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-accent">
                {t("pros")}
              </h2>
              <InlineListEditor
                items={c.pros}
                onChange={(items) => patchContent("pros", items)}
                marker="accent"
                addLabel="Перевага"
                placeholder="Перевага…"
              />
            </div>
            <div className="px-5 py-4 sm:px-8">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-loss">
                {t("cons")}
              </h2>
              <InlineListEditor
                items={c.cons}
                onChange={(items) => patchContent("cons", items)}
                marker="loss"
                addLabel="Недолік"
                placeholder="Недолік…"
              />
            </div>
          </div>
        </section>

        {/* Калькулятор — той самий вигляд, редагує дефолти (₴) */}
        <section className="mt-10">
          {calcHeading}
          <AdminCalculator
            defaults={draft.defaults}
            onDefaultsChange={(d) => patchBase("defaults", d)}
            overrides={c.fieldOverrides}
            onOverridesChange={(o) => patchContent("fieldOverrides", o)}
            revenueLabels={c.revenueLabels}
            onRevenueLabelsChange={(r) => patchContent("revenueLabels", r)}
            onReset={() => patchBase("defaults", initialDefaults)}
          />
        </section>
      </>
    );
  }

  // ── VIEW / PREVIEW ──
  const useDraft = (mode === "preview" || !business) && draft;
  const display: DisplayData = useDraft
    ? {
        category: draft.category as BusinessCategory,
        difficulty: draft.difficulty,
        risk: draft.risk,
        budgetMin: draft.budgetMin,
        budgetMax: draft.budgetMax,
        name: draft.content[tab].name,
        description: draft.content[tab].description,
        pros: draft.content[tab].pros,
        cons: draft.content[tab].cons,
      }
    : business
      ? {
          category: business.category,
          difficulty: business.difficulty,
          risk: business.risk,
          budgetMin: business.recommendedBudget.min,
          budgetMax: business.recommendedBudget.max,
          name: business.name,
          description: business.description,
          pros: business.pros,
          cons: business.cons,
        }
      : {
          category: "food",
          difficulty: 0,
          risk: 0,
          budgetMin: 0,
          budgetMax: 0,
          name: "",
          description: "",
          pros: [],
          cons: [],
        };

  return (
    <>
      <section className="rise-in relative overflow-hidden rounded-2xl border border-line bg-card shadow-hard">
        {mode === "preview" ? (
          <div className="flex items-center justify-between gap-3 border-b border-line bg-inset px-5 py-2 sm:px-8">
            <span className="text-xs uppercase tracking-wider text-ink-faint">
              Прев&apos;ю · {tab.toUpperCase()}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft transition-colors hover:text-ink"
              >
                ← Редагувати
              </button>
              <button
                type="button"
                onClick={save}
                disabled={busy}
                className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-on-accent)] transition-colors hover:bg-accent-deep disabled:opacity-50"
              >
                {busy ? "…" : isCreate ? "Створити" : "Зберегти"}
              </button>
            </div>
          </div>
        ) : isAdmin && business ? (
          <button
            type="button"
            onClick={enterEdit}
            disabled={busy}
            aria-label="Редагувати"
            title="Редагувати"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-card text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        ) : null}

        <div className="border-b border-line px-5 py-6 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            {chip(display.category)}
            <LevelMeter
              label={tm("difficulty")}
              value={display.difficulty}
              variant="difficulty"
            />
            <LevelMeter
              label={tm("risk")}
              value={display.risk}
              variant="risk"
            />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
            {display.name}
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
            {display.description}
          </p>
          <p className="mt-4 inline-block rounded-full border border-line bg-inset px-3 py-1.5 font-mono text-sm">
            <span className="text-ink-faint">{t("recommendedStart")}</span>{" "}
            <span className="font-semibold">
              <BudgetRange min={display.budgetMin} max={display.budgetMax} />
            </span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2">
          <div className="border-b border-line px-5 py-4 sm:border-b-0 sm:border-r sm:px-8">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-accent">
              {t("pros")}
            </h2>
            <ul className="mt-2 space-y-1.5">
              {display.pros.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink-soft">
                  <span className="text-accent">▪</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="px-5 py-4 sm:px-8">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-loss">
              {t("cons")}
            </h2>
            <ul className="mt-2 space-y-1.5">
              {display.cons.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink-soft">
                  <span className="text-loss">▪</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Калькулятор: у прев'ю — з чернетки, у перегляді — публічний */}
      <section className="mt-10">
        {calcHeading}
        {mode === "preview" && draft ? (
          <AdminCalculator
            defaults={draft.defaults}
            onDefaultsChange={(d) => patchBase("defaults", d)}
            overrides={draft.content[tab].fieldOverrides}
            onOverridesChange={(o) => patchContent("fieldOverrides", o)}
            revenueLabels={draft.content[tab].revenueLabels}
            onRevenueLabelsChange={(r) => patchContent("revenueLabels", r)}
            onReset={() => patchBase("defaults", initialDefaults)}
          />
        ) : business ? (
          <Calculator business={business} />
        ) : null}
      </section>
    </>
  );
}

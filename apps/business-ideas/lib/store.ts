import { create } from "zustand";

import type {
  CalculatorInputs,
  MonthlyCosts,
  RevenueInputs,
  StartupCosts,
} from "@/lib/types";

const STORAGE_KEY = "bi:scenarios";

/** Максимум сценаріїв на один бізнес */
export const MAX_SCENARIOS = 5;

/** Один збережений варіант розрахунку бізнесу */
export interface Scenario {
  id: string;
  inputs: CalculatorInputs;
}

interface BusinessCalc {
  scenarios: Scenario[];
  activeId: string;
}

/**
 * Стан калькуляторів: на кожен бізнес — кілька сценаріїв («Варіант 1/2/…»),
 * щоб рахувати й порівнювати різні набори припущень. Живе в localStorage,
 * тож розрахунки переживають перезавантаження сторінки.
 */
interface CalculatorStore {
  calcBySlug: Record<string, BusinessCalc>;
  hydrated: boolean;
  hydrate: () => void;
  ensure: (slug: string, defaults: CalculatorInputs) => void;
  setActive: (slug: string, id: string) => void;
  /** Додає новий сценарій — копію активного — і робить його активним */
  addScenario: (slug: string) => void;
  removeScenario: (slug: string, id: string) => void;
  setStartupField: (
    slug: string,
    field: keyof StartupCosts,
    value: number,
  ) => void;
  setMonthlyField: (
    slug: string,
    field: keyof MonthlyCosts,
    value: number,
  ) => void;
  setRevenueField: (
    slug: string,
    field: keyof RevenueInputs,
    value: number,
  ) => void;
  /** Скидає активний сценарій до дефолтів бізнесу */
  resetActive: (slug: string, defaults: CalculatorInputs) => void;
}

function cloneInputs(inputs: CalculatorInputs): CalculatorInputs {
  return {
    startup: { ...inputs.startup },
    monthly: { ...inputs.monthly },
    revenue: { ...inputs.revenue },
  };
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function persist(calcBySlug: Record<string, BusinessCalc>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(calcBySlug));
  } catch {
    // приватний режим / вимкнене сховище — не критично
  }
}

/** Оновлює активний сценарій slug-а через updater; решту стану не чіпає */
function updateActive(
  state: CalculatorStore,
  slug: string,
  update: (inputs: CalculatorInputs) => CalculatorInputs,
): Pick<CalculatorStore, "calcBySlug"> | null {
  const calc = state.calcBySlug[slug];
  if (!calc) return null;
  const next = {
    ...state.calcBySlug,
    [slug]: {
      ...calc,
      scenarios: calc.scenarios.map((s) =>
        s.id === calc.activeId ? { ...s, inputs: update(s.inputs) } : s,
      ),
    },
  };
  persist(next);
  return { calcBySlug: next };
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  calcBySlug: {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated || typeof window === "undefined") return;
    let stored: Record<string, BusinessCalc> = {};
    try {
      stored = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) ?? "{}",
      ) as Record<string, BusinessCalc>;
    } catch {
      stored = {};
    }
    set({ calcBySlug: stored, hydrated: true });
  },

  ensure: (slug, defaults) =>
    set((state) => {
      const existing = state.calcBySlug[slug];
      if (existing && existing.scenarios.length > 0) return state;
      const first: Scenario = { id: newId(), inputs: cloneInputs(defaults) };
      return {
        calcBySlug: {
          ...state.calcBySlug,
          [slug]: { scenarios: [first], activeId: first.id },
        },
      };
    }),

  setActive: (slug, id) =>
    set((state) => {
      const calc = state.calcBySlug[slug];
      if (!calc || !calc.scenarios.some((s) => s.id === id)) return state;
      const next = { ...state.calcBySlug, [slug]: { ...calc, activeId: id } };
      persist(next);
      return { calcBySlug: next };
    }),

  addScenario: (slug) =>
    set((state) => {
      const calc = state.calcBySlug[slug];
      if (!calc || calc.scenarios.length >= MAX_SCENARIOS) return state;
      const active =
        calc.scenarios.find((s) => s.id === calc.activeId) ?? calc.scenarios[0];
      const copy: Scenario = {
        id: newId(),
        inputs: cloneInputs(active.inputs),
      };
      const next = {
        ...state.calcBySlug,
        [slug]: {
          scenarios: [...calc.scenarios, copy],
          activeId: copy.id,
        },
      };
      persist(next);
      return { calcBySlug: next };
    }),

  removeScenario: (slug, id) =>
    set((state) => {
      const calc = state.calcBySlug[slug];
      if (!calc || calc.scenarios.length <= 1) return state;
      const scenarios = calc.scenarios.filter((s) => s.id !== id);
      const activeId =
        calc.activeId === id
          ? scenarios[scenarios.length - 1].id
          : calc.activeId;
      const next = {
        ...state.calcBySlug,
        [slug]: { scenarios, activeId },
      };
      persist(next);
      return { calcBySlug: next };
    }),

  setStartupField: (slug, field, value) =>
    set(
      (state) =>
        updateActive(state, slug, (inputs) => ({
          ...inputs,
          startup: { ...inputs.startup, [field]: value },
        })) ?? state,
    ),

  setMonthlyField: (slug, field, value) =>
    set(
      (state) =>
        updateActive(state, slug, (inputs) => ({
          ...inputs,
          monthly: { ...inputs.monthly, [field]: value },
        })) ?? state,
    ),

  setRevenueField: (slug, field, value) =>
    set(
      (state) =>
        updateActive(state, slug, (inputs) => ({
          ...inputs,
          revenue: { ...inputs.revenue, [field]: value },
        })) ?? state,
    ),

  resetActive: (slug, defaults) =>
    set(
      (state) =>
        updateActive(state, slug, () => cloneInputs(defaults)) ?? state,
    ),
}));

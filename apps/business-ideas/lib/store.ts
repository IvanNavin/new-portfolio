import { create } from "zustand";

import type {
  CalculatorInputs,
  MonthlyCosts,
  RevenueInputs,
  StartupCosts,
} from "@/lib/types";

/**
 * Стан калькуляторів, ключований slug-ом бізнесу: значення живуть,
 * поки користувач ходить між сторінками. Така структура дозволяє далі
 * додати persist (збереження розрахунків) і порівняння кількох бізнесів.
 */
interface CalculatorStore {
  inputsBySlug: Record<string, CalculatorInputs>;
  ensureInputs: (slug: string, defaults: CalculatorInputs) => void;
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
  resetInputs: (slug: string, defaults: CalculatorInputs) => void;
}

function cloneInputs(inputs: CalculatorInputs): CalculatorInputs {
  return {
    startup: { ...inputs.startup },
    monthly: { ...inputs.monthly },
    revenue: { ...inputs.revenue },
  };
}

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  inputsBySlug: {},

  ensureInputs: (slug, defaults) =>
    set((state) =>
      state.inputsBySlug[slug]
        ? state
        : {
            inputsBySlug: {
              ...state.inputsBySlug,
              [slug]: cloneInputs(defaults),
            },
          },
    ),

  setStartupField: (slug, field, value) =>
    set((state) => {
      const current = state.inputsBySlug[slug];
      if (!current) return state;
      return {
        inputsBySlug: {
          ...state.inputsBySlug,
          [slug]: {
            ...current,
            startup: { ...current.startup, [field]: value },
          },
        },
      };
    }),

  setMonthlyField: (slug, field, value) =>
    set((state) => {
      const current = state.inputsBySlug[slug];
      if (!current) return state;
      return {
        inputsBySlug: {
          ...state.inputsBySlug,
          [slug]: {
            ...current,
            monthly: { ...current.monthly, [field]: value },
          },
        },
      };
    }),

  setRevenueField: (slug, field, value) =>
    set((state) => {
      const current = state.inputsBySlug[slug];
      if (!current) return state;
      return {
        inputsBySlug: {
          ...state.inputsBySlug,
          [slug]: {
            ...current,
            revenue: { ...current.revenue, [field]: value },
          },
        },
      };
    }),

  resetInputs: (slug, defaults) =>
    set((state) => ({
      inputsBySlug: {
        ...state.inputsBySlug,
        [slug]: cloneInputs(defaults),
      },
    })),
}));

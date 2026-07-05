"use client";

import { useEffect, useMemo } from "react";

import { buildCumulativeProfitSeries, calculate } from "@/lib/calculations";
import { useCalculatorStore } from "@/lib/store";
import type {
  Business,
  CalculationResult,
  CalculatorInputs,
  CumulativeProfitPoint,
  MonthlyCosts,
  RevenueInputs,
  StartupCosts,
} from "@/lib/types";

export interface UseCalculatorResult {
  inputs: CalculatorInputs;
  result: CalculationResult;
  cumulativeSeries: CumulativeProfitPoint[];
  setStartupField: (field: keyof StartupCosts, value: number) => void;
  setMonthlyField: (field: keyof MonthlyCosts, value: number) => void;
  setRevenueField: (field: keyof RevenueInputs, value: number) => void;
  reset: () => void;
}

/**
 * Єдина точка входу для калькулятора бізнесу: підв'язує стор до slug-а,
 * ініціалізує значення за замовчуванням і повертає готові розрахунки.
 */
export function useCalculator(business: Business): UseCalculatorResult {
  const { slug, defaults } = business;

  const ensureInputs = useCalculatorStore((state) => state.ensureInputs);
  const storedInputs = useCalculatorStore((state) => state.inputsBySlug[slug]);
  const setStartup = useCalculatorStore((state) => state.setStartupField);
  const setMonthly = useCalculatorStore((state) => state.setMonthlyField);
  const setRevenue = useCalculatorStore((state) => state.setRevenueField);
  const resetInputs = useCalculatorStore((state) => state.resetInputs);

  useEffect(() => {
    ensureInputs(slug, defaults);
  }, [ensureInputs, slug, defaults]);

  const inputs = storedInputs ?? defaults;

  const result = useMemo(() => calculate(inputs), [inputs]);
  const cumulativeSeries = useMemo(
    () => buildCumulativeProfitSeries(result),
    [result],
  );

  return {
    inputs,
    result,
    cumulativeSeries,
    setStartupField: (field, value) => setStartup(slug, field, value),
    setMonthlyField: (field, value) => setMonthly(slug, field, value),
    setRevenueField: (field, value) => setRevenue(slug, field, value),
    reset: () => resetInputs(slug, defaults),
  };
}

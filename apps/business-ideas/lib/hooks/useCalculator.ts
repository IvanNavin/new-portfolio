"use client";

import { useEffect, useMemo } from "react";

import { buildCumulativeProfitSeries, calculate } from "@/lib/calculations";
import { MAX_SCENARIOS, type Scenario, useCalculatorStore } from "@/lib/store";
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
  /** Усі сценарії бізнесу (мінімум один) */
  scenarios: Scenario[];
  activeId: string;
  canAddScenario: boolean;
  setActive: (id: string) => void;
  addScenario: () => void;
  removeScenario: (id: string) => void;
  setStartupField: (field: keyof StartupCosts, value: number) => void;
  setMonthlyField: (field: keyof MonthlyCosts, value: number) => void;
  setRevenueField: (field: keyof RevenueInputs, value: number) => void;
  reset: () => void;
}

/**
 * Єдина точка входу для калькулятора бізнесу: підв'язує стор до slug-а,
 * гідратує збережені сценарії, ініціалізує перший і повертає розрахунки
 * активного сценарію.
 */
export function useCalculator(business: Business): UseCalculatorResult {
  const { slug, defaults } = business;

  const hydrate = useCalculatorStore((state) => state.hydrate);
  const ensure = useCalculatorStore((state) => state.ensure);
  const calc = useCalculatorStore((state) => state.calcBySlug[slug]);
  const setActive = useCalculatorStore((state) => state.setActive);
  const addScenario = useCalculatorStore((state) => state.addScenario);
  const removeScenario = useCalculatorStore((state) => state.removeScenario);
  const setStartup = useCalculatorStore((state) => state.setStartupField);
  const setMonthly = useCalculatorStore((state) => state.setMonthlyField);
  const setRevenue = useCalculatorStore((state) => state.setRevenueField);
  const resetActive = useCalculatorStore((state) => state.resetActive);

  useEffect(() => {
    hydrate();
    ensure(slug, defaults);
  }, [hydrate, ensure, slug, defaults]);

  const scenarios = useMemo<Scenario[]>(
    () =>
      calc && calc.scenarios.length > 0
        ? calc.scenarios
        : [{ id: "draft", inputs: defaults }],
    [calc, defaults],
  );
  const activeId = calc?.activeId ?? scenarios[0].id;
  const inputs =
    scenarios.find((s) => s.id === activeId)?.inputs ?? scenarios[0].inputs;

  const result = useMemo(() => calculate(inputs), [inputs]);
  const cumulativeSeries = useMemo(
    () => buildCumulativeProfitSeries(result),
    [result],
  );

  return {
    inputs,
    result,
    cumulativeSeries,
    scenarios,
    activeId,
    canAddScenario: scenarios.length < MAX_SCENARIOS,
    setActive: (id) => setActive(slug, id),
    addScenario: () => addScenario(slug),
    removeScenario: (id) => removeScenario(slug, id),
    setStartupField: (field, value) => setStartup(slug, field, value),
    setMonthlyField: (field, value) => setMonthly(slug, field, value),
    setRevenueField: (field, value) => setRevenue(slug, field, value),
    reset: () => resetActive(slug, defaults),
  };
}

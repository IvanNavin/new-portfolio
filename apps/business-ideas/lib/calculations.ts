import type {
  CalculationResult,
  CalculatorInputs,
  CumulativeProfitPoint,
  MonthlyCosts,
  StartupCosts,
} from "@/lib/types";

export function sumStartupCosts(startup: StartupCosts): number {
  return (
    startup.equipment +
    startup.renovation +
    startup.furniture +
    startup.initialStock +
    startup.licenses +
    startup.marketing +
    startup.other
  );
}

export function sumMonthlyCosts(monthly: MonthlyCosts): number {
  return (
    monthly.rent +
    monthly.salaries +
    monthly.utilities +
    monthly.marketing +
    monthly.accounting +
    monthly.software +
    monthly.other
  );
}

export function calculateMonthlyRevenue(inputs: CalculatorInputs): number {
  const { clientsPerDay, averageCheck, workDaysPerMonth } = inputs.revenue;
  return clientsPerDay * averageCheck * workDaysPerMonth;
}

export function calculate(inputs: CalculatorInputs): CalculationResult {
  const startupTotal = sumStartupCosts(inputs.startup);
  const monthlyCostsTotal = sumMonthlyCosts(inputs.monthly);
  const monthlyRevenue = calculateMonthlyRevenue(inputs);

  const margin = inputs.revenue.marginPercent / 100;
  const grossProfit = monthlyRevenue * margin;
  const netProfit = grossProfit - monthlyCostsTotal;

  const breakEvenRevenue = margin > 0 ? monthlyCostsTotal / margin : Infinity;

  const revenuePerClientPerMonth =
    inputs.revenue.averageCheck * inputs.revenue.workDaysPerMonth * margin;
  const breakEvenClientsPerDay =
    revenuePerClientPerMonth > 0
      ? monthlyCostsTotal / revenuePerClientPerMonth
      : Infinity;

  const paybackMonths = netProfit > 0 ? startupTotal / netProfit : null;

  const profitabilityPercent =
    monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;

  return {
    startupTotal,
    monthlyCostsTotal,
    monthlyRevenue,
    grossProfit,
    netProfit,
    breakEvenRevenue,
    breakEvenClientsPerDay,
    paybackMonths,
    profitabilityPercent,
  };
}

/**
 * Накопичений прибуток по місяцях: старт з −(стартові вкладення),
 * далі щомісяця додається чистий прибуток.
 */
export function buildCumulativeProfitSeries(
  result: CalculationResult,
  months = 24,
): CumulativeProfitPoint[] {
  const points: CumulativeProfitPoint[] = [];
  for (let month = 0; month <= months; month += 1) {
    points.push({
      month,
      cumulative: Math.round(-result.startupTotal + result.netProfit * month),
    });
  }
  return points;
}

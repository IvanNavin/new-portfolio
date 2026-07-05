"use client";

import { useCurrency } from "@/lib/hooks/useCurrency";

/** Сума в гривнях, показана в обраній користувачем валюті */
export function Money({
  uah,
  compact = false,
}: {
  uah: number;
  compact?: boolean;
}) {
  const { money, moneyCompact } = useCurrency();
  return <>{compact ? moneyCompact(uah) : money(uah)}</>;
}

/** Діапазон бюджету (від/до) в обраній валюті */
export function BudgetRange({ min, max }: { min: number; max: number }) {
  const { budget } = useCurrency();
  return <>{budget(min, max)}</>;
}

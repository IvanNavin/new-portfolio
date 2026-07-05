import type { ReactNode } from "react";

interface SectionCardProps {
  index: string;
  title: string;
  totalLabel?: string;
  totalValue?: string;
  children: ReactNode;
}

/** Картка-секція калькулятора з номером, назвою та підсумком */
export function SectionCard({
  index,
  title,
  totalLabel,
  totalValue,
  children,
}: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-hard">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="flex items-baseline gap-2">
          <span className="font-mono text-xs text-ink-faint">{index}</span>
          <span className="font-display text-sm font-semibold uppercase tracking-wide">
            {title}
          </span>
        </h2>
        {totalValue ? (
          <p className="text-right">
            <span className="mr-2 hidden text-xs uppercase tracking-wider text-ink-faint sm:inline">
              {totalLabel}
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {totalValue}
            </span>
          </p>
        ) : null}
      </header>
      <div className="px-4 py-2">{children}</div>
    </section>
  );
}

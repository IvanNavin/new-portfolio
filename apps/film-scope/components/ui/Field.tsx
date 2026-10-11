import type { ReactNode } from "react";

export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
      {label}
    </span>
    {children}
    {hint ? (
      <p className="text-[11px] leading-snug text-ink-faint">{hint}</p>
    ) : null}
  </div>
);

export const inputClass =
  "w-full rounded-lg border border-edge bg-surface-raised px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent/60";

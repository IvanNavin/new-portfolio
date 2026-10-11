"use client";

import { SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import { useFilters } from "@/components/filters/useFilters";
import { countActiveFilters } from "@/lib/filters/schema";

export const MobileFilters = ({ children }: { children: ReactNode }) => {
  const t = useTranslations("filters");
  const { query, reset } = useFilters();
  const [open, setOpen] = useState(false);

  // With the panel collapsed there is nothing else telling a phone user that
  // six filters are narrowing their results.
  const active = countActiveFilters(query);

  return (
    <div className="lg:hidden">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-edge bg-surface-raised px-3 py-2 text-sm text-ink-dim"
        >
          <SlidersHorizontal size={15} />
          {open ? t("hide") : t("show")}
          {active ? (
            <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">
              {active}
            </span>
          ) : null}
        </button>
        {active ? (
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-edge bg-surface-raised px-3 py-2 text-sm text-ink-faint transition-colors hover:text-danger"
          >
            {t("reset")}
          </button>
        ) : null}
      </div>
      {open ? <div className="pt-4">{children}</div> : null}
    </div>
  );
};

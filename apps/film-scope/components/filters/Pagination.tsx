"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { useFilters } from "@/components/filters/useFilters";

export const Pagination = ({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) => {
  const t = useTranslations("results");
  const { patch } = useFilters();

  if (totalPages <= 1) return null;

  const go = (next: number) => {
    patch({ page: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buttonClass =
    "inline-flex items-center gap-1 rounded-lg border border-edge bg-surface-raised px-3 py-2 text-sm text-ink-dim transition-colors enabled:hover:border-edge-strong enabled:hover:text-ink disabled:opacity-40";

  return (
    <nav className="flex items-center justify-center gap-3 pt-2">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={buttonClass}
      >
        <ChevronLeft size={14} />
        {t("previous")}
      </button>
      <span className="text-sm text-ink-faint">
        {t("page", { page, total: totalPages })}
      </span>
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className={buttonClass}
      >
        {t("next")}
        <ChevronRight size={14} />
      </button>
    </nav>
  );
};

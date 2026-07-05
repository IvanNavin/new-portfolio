"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { ScalesIcon } from "@/components/ui/ScalesIcon";
import { Link, usePathname } from "@/i18n/navigation";
import { useCompareStore } from "@/lib/compareStore";

/**
 * Плаваюча кнопка порівняння. Зʼявляється, лише коли щось обрано,
 * і ховається на самій сторінці порівняння.
 */
export function CompareBar() {
  const t = useTranslations("compare");
  const pathname = usePathname();
  const selected = useCompareStore((state) => state.selected);
  const clear = useCompareStore((state) => state.clear);
  const hydrate = useCompareStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (selected.length === 0 || pathname === "/compare") return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex items-center gap-1 border border-line bg-card p-1 shadow-hard">
        <Link
          href="/compare"
          className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-on-accent)] transition-colors hover:bg-accent-deep"
        >
          <ScalesIcon className="h-4 w-4" />
          {t("cta")}
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--color-on-accent)] px-1 font-mono text-xs text-accent-deep">
            {selected.length}
          </span>
        </Link>
        <button
          type="button"
          onClick={clear}
          aria-label={t("clear")}
          title={t("clear")}
          className="px-2 py-2 text-ink-faint transition-colors hover:text-loss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

import Link from "next/link";

import { buildHref, FeedParams } from "@lib/feedParams";
import { CATEGORY_LABELS, Category } from "@lib/sources";

type Tab = { key: Category | "all"; label: string };

const TABS: Tab[] = [
  { key: "all", label: "All" },
  ...(Object.entries(CATEGORY_LABELS) as [Category, string][]).map<Tab>(
    ([key, label]) => ({ key, label }),
  ),
];

type Props = {
  active: Category | "all";
  counts: Record<string, number>;
  params: FeedParams;
};

export function CategoryTabs({ active, counts, params }: Props) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Category filter">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const count = counts[tab.key] ?? 0;
        const href = buildHref(params, { category: tab.key });
        return (
          <Link
            key={tab.key}
            href={href}
            prefetch={false}
            aria-current={isActive ? "page" : undefined}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
              "focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none",
              isActive
                ? "border-sky-400/60 bg-sky-400/10 text-sky-100"
                : "border-[var(--border)] text-[var(--text-dim)] hover:border-sky-400/40 hover:text-[var(--text)]",
            ].join(" ")}
          >
            <span>{tab.label}</span>
            <span
              className={[
                "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                isActive ? "bg-sky-400/20 text-sky-50" : "bg-white/5",
              ].join(" ")}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

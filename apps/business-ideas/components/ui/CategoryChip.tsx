import { getTranslations } from "next-intl/server";

import type { BusinessCategory } from "@/lib/types";

export async function CategoryChip({
  category,
}: {
  category: BusinessCategory;
}) {
  const t = await getTranslations("categories");
  return (
    <span className="inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent-deep">
      {t(category)}
    </span>
  );
}

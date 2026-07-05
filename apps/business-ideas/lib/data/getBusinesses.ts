import { asc, eq } from "drizzle-orm";

import type { Locale } from "@/i18n/routing";
import { businesses as businessesUk } from "@/lib/data/businesses";
import { businessesEn } from "@/lib/data/businesses.en";
import { db } from "@/lib/db/client";
import {
  businessContent,
  type BusinessContentRow,
  businesses as businessesTable,
  type BusinessRow,
} from "@/lib/db/schema";
import type { Business, BusinessCategory } from "@/lib/types";

const fallbackByLocale: Record<Locale, Business[]> = {
  uk: businessesUk,
  en: businessesEn,
};

function rowToBusiness(
  base: BusinessRow,
  content: BusinessContentRow,
): Business {
  return {
    id: base.slug,
    slug: base.slug,
    category: base.category as BusinessCategory,
    difficulty: base.difficulty,
    risk: base.risk,
    recommendedBudget: { min: base.budgetMin, max: base.budgetMax },
    defaults: base.defaults,
    name: content.name,
    shortDescription: content.shortDescription,
    description: content.description,
    pros: content.pros,
    cons: content.cons,
    revenueLabels: content.revenueLabels ?? undefined,
    fieldOverrides: content.fieldOverrides ?? undefined,
  };
}

export async function getBusinesses(locale: Locale): Promise<Business[]> {
  if (db) {
    const rows = await db
      .select()
      .from(businessesTable)
      .innerJoin(
        businessContent,
        eq(businessContent.slug, businessesTable.slug),
      )
      .where(eq(businessContent.locale, locale))
      .orderBy(asc(businessesTable.sortOrder));
    if (rows.length > 0) {
      return rows.map((row) =>
        rowToBusiness(row.businesses, row.business_content),
      );
    }
  }
  return fallbackByLocale[locale] ?? businessesUk;
}

export async function getBusinessBySlug(
  slug: string,
  locale: Locale,
): Promise<Business | undefined> {
  const all = await getBusinesses(locale);
  return all.find((business) => business.slug === slug);
}

/** Slug-и локале-незалежні — для generateStaticParams */
export async function getBusinessSlugs(): Promise<string[]> {
  if (db) {
    const rows = await db
      .select({ slug: businessesTable.slug })
      .from(businessesTable)
      .orderBy(asc(businessesTable.sortOrder));
    if (rows.length > 0) return rows.map((row) => row.slug);
  }
  return businessesUk.map((business) => business.slug);
}

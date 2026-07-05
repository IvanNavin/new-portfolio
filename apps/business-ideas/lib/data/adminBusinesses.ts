import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { businessContent, businesses } from "@/lib/db/schema";
import type {
  CalculatorInputs,
  FieldOverrides,
  RevenueFieldLabels,
} from "@/lib/types";

export const ADMIN_LOCALES = ["uk", "en"] as const;
export type AdminLocale = (typeof ADMIN_LOCALES)[number];

export interface AdminContent {
  name: string;
  shortDescription: string;
  description: string;
  pros: string[];
  cons: string[];
  revenueLabels?: RevenueFieldLabels;
  fieldOverrides?: FieldOverrides;
}

export interface AdminBusiness {
  slug: string;
  category: string;
  difficulty: number;
  risk: number;
  budgetMin: number;
  budgetMax: number;
  defaults: CalculatorInputs;
  sortOrder: number;
  content: Record<AdminLocale, AdminContent>;
}

export interface AdminListItem {
  slug: string;
  name: string;
  category: string;
  difficulty: number;
  risk: number;
  sortOrder: number;
}

function requireDb() {
  if (!db) throw new Error("DATABASE_URL не налаштовано");
  return db;
}

export async function listAdminBusinesses(): Promise<AdminListItem[]> {
  const rows = await requireDb()
    .select({
      slug: businesses.slug,
      name: businessContent.name,
      category: businesses.category,
      difficulty: businesses.difficulty,
      risk: businesses.risk,
      sortOrder: businesses.sortOrder,
    })
    .from(businesses)
    .leftJoin(businessContent, eq(businessContent.slug, businesses.slug))
    .where(eq(businessContent.locale, "uk"))
    .orderBy(asc(businesses.sortOrder));
  return rows.map((row) => ({ ...row, name: row.name ?? row.slug }));
}

export async function getAdminBusiness(
  slug: string,
): Promise<AdminBusiness | null> {
  const database = requireDb();
  const [base] = await database
    .select()
    .from(businesses)
    .where(eq(businesses.slug, slug));
  if (!base) return null;

  const contentRows = await database
    .select()
    .from(businessContent)
    .where(eq(businessContent.slug, slug));

  const content = {} as Record<AdminLocale, AdminContent>;
  for (const locale of ADMIN_LOCALES) {
    const row = contentRows.find((r) => r.locale === locale);
    content[locale] = {
      name: row?.name ?? "",
      shortDescription: row?.shortDescription ?? "",
      description: row?.description ?? "",
      pros: row?.pros ?? [],
      cons: row?.cons ?? [],
      revenueLabels: row?.revenueLabels ?? undefined,
      fieldOverrides: row?.fieldOverrides ?? undefined,
    };
  }

  return {
    slug: base.slug,
    category: base.category,
    difficulty: base.difficulty,
    risk: base.risk,
    budgetMin: base.budgetMin,
    budgetMax: base.budgetMax,
    defaults: base.defaults,
    sortOrder: base.sortOrder,
    content,
  };
}

export async function upsertAdminBusiness(data: AdminBusiness): Promise<void> {
  const database = requireDb();
  const base = {
    slug: data.slug,
    category: data.category,
    difficulty: data.difficulty,
    risk: data.risk,
    budgetMin: data.budgetMin,
    budgetMax: data.budgetMax,
    defaults: data.defaults,
    sortOrder: data.sortOrder,
    updatedAt: new Date(),
  };

  await database
    .insert(businesses)
    .values(base)
    .onConflictDoUpdate({ target: businesses.slug, set: base });

  for (const locale of ADMIN_LOCALES) {
    const c = data.content[locale];
    const row = {
      slug: data.slug,
      locale,
      name: c.name,
      shortDescription: c.shortDescription,
      description: c.description,
      pros: c.pros,
      cons: c.cons,
      revenueLabels: c.revenueLabels ?? null,
      fieldOverrides: c.fieldOverrides ?? null,
    };
    await database
      .insert(businessContent)
      .values(row)
      .onConflictDoUpdate({
        target: [businessContent.slug, businessContent.locale],
        set: row,
      });
  }
}

export async function deleteAdminBusiness(slug: string): Promise<void> {
  await requireDb().delete(businesses).where(eq(businesses.slug, slug));
}

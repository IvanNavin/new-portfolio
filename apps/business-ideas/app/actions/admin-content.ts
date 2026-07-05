"use server";

import { revalidatePath } from "next/cache";

import { isAuthenticated } from "@/lib/auth";
import {
  type AdminBusiness,
  deleteAdminBusiness,
  getAdminBusiness,
  upsertAdminBusiness,
} from "@/lib/data/adminBusinesses";

async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Немає прав адміністратора");
  }
}

/** Повні дані бізнесу (обидві мови + структура) для редагування */
export async function getBusinessForEdit(
  slug: string,
): Promise<AdminBusiness | null> {
  await requireAdmin();
  return getAdminBusiness(slug);
}

export async function deleteBusiness(slug: string): Promise<void> {
  await requireAdmin();
  await deleteAdminBusiness(slug);
  revalidatePath("/", "layout");
}

export async function saveBusiness(data: AdminBusiness): Promise<void> {
  await requireAdmin();
  await upsertAdminBusiness(data);
  revalidatePath("/", "layout");
}

/** Заповнити порожню БД дефолтними бізнесами з вбудованих даних */
export async function seedFromDefaults(): Promise<void> {
  await requireAdmin();
  const { businesses: ukData } = await import("@/lib/data/businesses");
  const { businessesEn: enData } = await import("@/lib/data/businesses.en");
  for (let i = 0; i < ukData.length; i += 1) {
    const uk = ukData[i];
    const en = enData[i];
    await upsertAdminBusiness({
      slug: uk.slug,
      category: uk.category,
      difficulty: uk.difficulty,
      risk: uk.risk,
      budgetMin: uk.recommendedBudget.min,
      budgetMax: uk.recommendedBudget.max,
      defaults: uk.defaults,
      sortOrder: i,
      content: {
        uk: {
          name: uk.name,
          shortDescription: uk.shortDescription,
          description: uk.description,
          pros: uk.pros,
          cons: uk.cons,
          revenueLabels: uk.revenueLabels,
          fieldOverrides: uk.fieldOverrides,
        },
        en: {
          name: en.name,
          shortDescription: en.shortDescription,
          description: en.description,
          pros: en.pros,
          cons: en.cons,
          revenueLabels: en.revenueLabels,
          fieldOverrides: en.fieldOverrides,
        },
      },
    });
  }
  revalidatePath("/", "layout");
}

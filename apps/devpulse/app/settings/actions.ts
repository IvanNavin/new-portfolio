"use server";

import { auth } from "@lib/auth";
import { prisma } from "@lib/prisma";
import { Category } from "@lib/sources";
import {
  addCustomSource,
  removeCustomSource,
  toggleSource,
} from "@lib/userSources";
import { revalidatePath } from "next/cache";

/**
 * Server actions for /settings. All operations require a signed-in
 * session; unauth requests no-op (no throw) so accidental double-submit
 * after sign-out doesn't crash the page.
 *
 * Each action revalidates / and /settings so the next render reflects
 * the change without a hard reload.
 */

export async function toggleSourceAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const sourceId = String(formData.get("sourceId") ?? "");
  const enabled = formData.get("enabled") === "true";
  if (!sourceId) return;
  await toggleSource(session.user.id, sourceId, enabled);
  revalidatePath("/");
  revalidatePath("/settings");
}

export type AddSourceFormState = {
  error?: string;
  ok?: boolean;
};

export async function addSourceAction(
  _prev: AddSourceFormState,
  formData: FormData,
): Promise<AddSourceFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to add sources." };
  const name = String(formData.get("name") ?? "");
  const url = String(formData.get("url") ?? "");
  const category = String(formData.get("category") ?? "") as Category;
  const result = await addCustomSource(session.user.id, {
    name,
    url,
    category,
  });
  if (!result.ok) return { error: result.error };
  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true };
}

export async function removeSourceAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const sourceId = String(formData.get("sourceId") ?? "");
  if (!sourceId) return;
  await removeCustomSource(session.user.id, sourceId);
  revalidatePath("/");
  revalidatePath("/settings");
}

export async function setShowPreReleasesAction(
  formData: FormData,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const show = formData.get("show") === "true";
  await prisma.devpulseUser.update({
    where: { id: session.user.id },
    data: { showPreReleases: show },
  });
  revalidatePath("/");
  revalidatePath("/settings");
}

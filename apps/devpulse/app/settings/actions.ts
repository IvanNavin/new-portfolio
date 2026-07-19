"use server";

import { auth } from "@lib/auth";
import { prisma } from "@lib/prisma";
import { isBlockedHost } from "@lib/safeFetch";
import { Category } from "@lib/sources";
import { addUserBoost, removeUserBoost } from "@lib/userBoosts";
import { addUserMute, removeUserMute } from "@lib/userMutes";
import {
  addCustomSource,
  MAX_CUSTOM_SOURCES,
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

export type AddBoostFormState = { error?: string; ok?: boolean };

export async function addBoostAction(
  _prev: AddBoostFormState,
  formData: FormData,
): Promise<AddBoostFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to add boosts." };
  const label = String(formData.get("label") ?? "");
  const termsRaw = String(formData.get("terms") ?? "");
  const weight = parseInt(String(formData.get("weight") ?? "3"), 10);
  const result = await addUserBoost(session.user.id, {
    label,
    termsRaw,
    weight,
  });
  if (!result.ok) return { error: result.error };
  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true };
}

export async function removeBoostAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await removeUserBoost(session.user.id, id);
  revalidatePath("/");
  revalidatePath("/settings");
}

export type AddMuteFormState = { error?: string; ok?: boolean };

export async function addMuteAction(
  _prev: AddMuteFormState,
  formData: FormData,
): Promise<AddMuteFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to add mute patterns." };
  const pattern = String(formData.get("pattern") ?? "");
  const result = await addUserMute(session.user.id, pattern);
  if (!result.ok) return { error: result.error };
  revalidatePath("/");
  revalidatePath("/settings");
  return { ok: true };
}

export async function removeMuteAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await removeUserMute(session.user.id, id);
  revalidatePath("/");
  revalidatePath("/settings");
}

export type ImportOpmlState = {
  imported?: number;
  skipped?: number;
  error?: string;
};

export async function importOpmlAction(
  _prev: ImportOpmlState,
  formData: FormData,
): Promise<ImportOpmlState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to import." };
  const file = formData.get("file");
  let xml = "";
  if (file instanceof File) {
    if (file.size > 1_000_000) return { error: "File too large (>1 MB)." };
    xml = await file.text();
  } else {
    const text = formData.get("text");
    if (typeof text === "string") xml = text;
  }
  if (!xml.trim()) return { error: "Empty OPML payload." };

  const { parseOpml } = await import("@lib/opml");
  const entries = parseOpml(xml);
  if (entries.length === 0) {
    return { error: "No <outline xmlUrl=…> entries found." };
  }

  // Same up-front protocol + SSRF check addCustomSource applies to a single
  // URL: drop anything that isn't a public http(s) endpoint so the importer
  // can't be used to seed private-network / non-http feed rows the cron then
  // repeatedly tries. safeFetch is still the final runtime guard.
  const valid = entries.filter((e) => {
    try {
      const u = new URL(e.url);
      return (
        (u.protocol === "https:" || u.protocol === "http:") &&
        !isBlockedHost(u.hostname)
      );
    } catch {
      return false;
    }
  });

  const existing = await prisma.devpulseSource.findMany({
    where: { url: { in: valid.map((e) => e.url) } },
    select: { url: true },
  });
  const seen = new Set(existing.map((r) => r.url));
  const fresh = valid.filter((e) => !seen.has(e.url));

  // Enforce the SAME per-user cap as addCustomSource so a bulk OPML upload
  // can't trivially defeat the anti-abuse limit. Import only up to the
  // remaining slots; the rest count as skipped.
  const myCount = await prisma.devpulseSource.count({
    where: { isBuiltIn: false, createdByUserId: session.user.id },
  });
  const remaining = Math.max(0, MAX_CUSTOM_SOURCES - myCount);
  const toImport = fresh.slice(0, remaining);

  if (toImport.length > 0) {
    await prisma.devpulseSource.createMany({
      data: toImport.map((e) => ({
        name: e.name,
        url: e.url,
        category: e.category,
        weight: 5,
        isBuiltIn: false,
        createdByUserId: session.user.id,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/");
  revalidatePath("/settings");
  return {
    imported: toImport.length,
    skipped: entries.length - toImport.length,
  };
}

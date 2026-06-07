import { prisma } from "./prisma";

export type UserBoost = {
  id: string;
  label: string;
  terms: string[];
  weight: number;
};

export async function listUserBoosts(userId: string): Promise<UserBoost[]> {
  const rows = await prisma.devpulseKeywordBoost.findMany({
    where: { userId },
    orderBy: [{ weight: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    terms: r.terms,
    weight: r.weight,
  }));
}

export type AddBoostInput = {
  label: string;
  /** Comma-separated input; we split + normalize. */
  termsRaw: string;
  weight: number;
};

export type AddBoostResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function addUserBoost(
  userId: string,
  input: AddBoostInput,
): Promise<AddBoostResult> {
  const label = input.label.trim().slice(0, 40);
  if (!label) return { ok: false, error: "Give the boost a short label." };
  const terms = input.termsRaw
    .split(/[,\n]/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (terms.length === 0) {
    return { ok: false, error: "Add at least one term." };
  }
  const weight = Math.max(1, Math.min(10, Math.floor(input.weight) || 3));

  // Anti-abuse cap. Far above any sane personal-tuning workload.
  const MAX_BOOSTS = 50;
  if (
    (await prisma.devpulseKeywordBoost.count({ where: { userId } })) >=
    MAX_BOOSTS
  ) {
    return {
      ok: false,
      error: `You've hit the ${MAX_BOOSTS}-boost cap. Remove one before adding another.`,
    };
  }

  const created = await prisma.devpulseKeywordBoost.create({
    data: { userId, label, terms, weight },
    select: { id: true },
  });
  return { ok: true, id: created.id };
}

export async function removeUserBoost(
  userId: string,
  id: string,
): Promise<void> {
  await prisma.devpulseKeywordBoost.deleteMany({ where: { id, userId } });
}

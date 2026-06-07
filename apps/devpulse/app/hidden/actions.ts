"use server";

import { auth } from "@lib/auth";
import { prisma } from "@lib/prisma";
import { revalidatePath } from "next/cache";

export async function restoreDismissedAction(
  formData: FormData,
): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const url = String(formData.get("url") ?? "");
  if (!url) return;
  await prisma.devpulseDismissedItem.deleteMany({
    where: { userId: session.user.id, url },
  });
  // Wake the home feed so the item reappears, and the /hidden list so
  // it falls off.
  revalidatePath("/");
  revalidatePath("/hidden");
}

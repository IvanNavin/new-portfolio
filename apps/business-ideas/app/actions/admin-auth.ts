"use server";

import { checkPassword, createSession, destroySession } from "@/lib/auth";

/** Логін через модалку. Повертає true, якщо пароль правильний. */
export async function adminLogin(password: string): Promise<boolean> {
  if (!checkPassword(password)) return false;
  await createSession();
  return true;
}

export async function adminLogout(): Promise<void> {
  await destroySession();
}

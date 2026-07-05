import { cookies } from "next/headers";

const COOKIE_NAME = "bi_admin";
/** Не-httpOnly підказка для UI: клієнт бачить, що показувати адмін-кнопки.
 *  Реальна перевірка прав — завжди по підписаній httpOnly-cookie на сервері. */
const UI_COOKIE_NAME = "bi_admin_ui";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 днів

function getSecret(): string {
  return process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return Buffer.from(signature).toString("base64url");
}

/** Пароль співпадає з ADMIN_PASSWORD (env)? */
export function checkPassword(password: string): boolean {
  const admin = process.env.ADMIN_PASSWORD;
  return Boolean(admin) && password === admin;
}

export async function createSession(): Promise<void> {
  const payload = `admin.${Date.now()}`;
  const signature = await sign(payload);
  const store = await cookies();
  store.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  store.set(UI_COOKIE_NAME, "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  store.delete(UI_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value) return false;
  const lastDot = value.lastIndexOf(".");
  if (lastDot < 0) return false;
  const payload = value.slice(0, lastDot);
  const signature = value.slice(lastDot + 1);
  return (await sign(payload)) === signature;
}

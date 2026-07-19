import { cookies } from "next/headers";

const COOKIE_NAME = "bi_admin";
/** Не-httpOnly підказка для UI: клієнт бачить, що показувати адмін-кнопки.
 *  Реальна перевірка прав — завжди по підписаній httpOnly-cookie на сервері. */
const UI_COOKIE_NAME = "bi_admin_ui";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 днів

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  // Fail closed у проді: без AUTH_SECRET підпис ставав публічною константою з
  // коду, і будь-хто міг підробити admin-cookie. Дев-фолбек лишаємо лише локально.
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is not set");
  }
  return "dev-insecure-secret-change-me";
}

/** Порівняння за сталий час (без ранього виходу) — проти timing-атак на
 *  підпис/пароль. Довжина не секрет (HMAC фіксованої довжини). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
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
  return Boolean(admin) && timingSafeEqual(password, admin as string);
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

  // 1) Підпис (за сталий час).
  if (!timingSafeEqual(await sign(payload), signature)) return false;

  // 2) Серверний строк дії: раніше перевірявся лише підпис, а вік токена жив
  //    тільки в maxAge cookie, тож витік значення давав вічний доступ.
  const issuedAt = Number(payload.split(".")[1]);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > MAX_AGE * 1000) return false;

  return true;
}

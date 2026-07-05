import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/lib/db/schema";

const url = process.env.DATABASE_URL;

/**
 * Клієнт БД. Якщо DATABASE_URL не заданий — null, і застосунок працює
 * на вбудованих TS-даних (фолбек). Це дозволяє розробляти й білдити
 * без підключеної бази.
 */
export const db = url ? drizzle(neon(url), { schema }) : null;

export const hasDatabase = Boolean(url);

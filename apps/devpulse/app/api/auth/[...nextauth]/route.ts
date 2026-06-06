// Auth.js v5 route handler — exposes GET/POST for the OAuth dance.
// All configuration lives in lib/auth.ts.
import { handlers } from "@lib/auth";

export const { GET, POST } = handlers;

export const runtime = "nodejs";

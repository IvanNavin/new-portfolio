import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Browsers auto-request /favicon.ico regardless of what icon links the
 * <head> declares. Without this route they get a 404 on every page,
 * which spam the console. We just stream our SVG icon with the right
 * content-type — modern browsers (and the addressbar of Vercel
 * deployments) accept SVG for favicons.
 */
export async function GET() {
  const file = await readFile(
    path.join(process.cwd(), "public", "icons", "icon.svg"),
  );
  return new Response(file, {
    headers: {
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=86400, immutable",
    },
  });
}

export const runtime = "nodejs";

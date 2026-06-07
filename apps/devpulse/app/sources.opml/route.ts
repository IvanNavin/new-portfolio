import { auth } from "@lib/auth";
import { emitOpml } from "@lib/opml";
import { listUserSettingsSources } from "@lib/userSources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /sources.opml → OPML file of the user's enabled feeds. Lets them
 * back up their devpulse subscriptions or pipe them into another RSS
 * reader as a "second opinion" stream.
 *
 * Auth required — OPML reveals user-added custom URLs which can be
 * private (a friend's blog feed, an internal company changelog, ...).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Sign in to download your OPML.", { status: 401 });
  }
  const sources = await listUserSettingsSources(session.user.id);
  const enabled = sources.filter((s) => s.enabled);
  const xml = emitOpml(
    `devpulse — ${session.user.email}`,
    enabled.map((s) => ({ name: s.name, url: s.url, category: s.category })),
  );
  return new Response(xml, {
    headers: {
      "content-type": "text/x-opml; charset=utf-8",
      "content-disposition": `attachment; filename="devpulse-sources.opml"`,
    },
  });
}

import { auth } from "@lib/auth";
import { prisma } from "@lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

import { restoreDismissedAction } from "./actions";

export const dynamic = "force-dynamic";

/**
 * /hidden — list of items the user dismissed, each with a Restore button
 * that pulls the URL back out of devpulse_dismissed_item so the next
 * home render shows it again. Auth-gated; anonymous visitors get bounced
 * home where the One Tap card offers a sign-in.
 */
export default async function HiddenPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const dismissed = await prisma.devpulseDismissedItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  const urls = dismissed.map((d) => d.url);
  const items =
    urls.length > 0
      ? await prisma.newsItem.findMany({
          where: { url: { in: urls } },
          select: {
            id: true,
            url: true,
            title: true,
            excerpt: true,
            source: true,
            publishedAt: true,
          },
        })
      : [];
  const itemByUrl = new Map(items.map((i) => [i.url, i]));

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-10">
        <div className="mb-3 flex items-center gap-2 text-xs tracking-widest text-[var(--text-dim)] uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
          <span>hidden stories</span>
        </div>
        <h1 className="mb-2 text-4xl font-semibold tracking-tight">Hidden</h1>
        <p className="text-[var(--text-dim)]">
          Items you hid earlier. Use Restore to bring one back to the feed.{" "}
          <Link
            href="/"
            prefetch={false}
            className="text-sky-300 hover:underline"
          >
            Back to feed →
          </Link>
        </p>
      </header>

      {dismissed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elev)]/40 p-10 text-center">
          <h2 className="mb-2 text-lg font-medium">Nothing hidden yet</h2>
          <p className="text-sm text-[var(--text-dim)]">
            When you press × on a card, it lands here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {dismissed.map((d) => {
            const item = itemByUrl.get(d.url);
            return (
              <li
                key={d.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)]/60 p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-[var(--text-dim)]">
                    {item ? item.source : "(source pruned)"}
                  </div>
                  <div className="truncate text-sm font-medium text-[var(--text)]">
                    {item ? item.title : d.url}
                  </div>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block truncate text-xs text-[var(--text-dim)] hover:text-sky-200"
                  >
                    {d.url}
                  </a>
                </div>
                <form action={restoreDismissedAction}>
                  <input type="hidden" name="url" value={d.url} />
                  <button
                    type="submit"
                    className="rounded-md border border-[var(--c-good-fg)] bg-[var(--c-good-soft)] px-3 py-1.5 text-sm font-medium text-[var(--c-good-fg)] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:outline-none"
                  >
                    Restore
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

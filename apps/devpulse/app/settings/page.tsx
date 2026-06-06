import { auth } from "@lib/auth";
import { Category, CATEGORY_LABELS } from "@lib/sources";
import { listUserSettingsSources, SourceWithToggle } from "@lib/userSources";
import Link from "next/link";
import { redirect } from "next/navigation";

import { removeSourceAction } from "./actions";
import { AddSourceForm } from "./AddSourceForm";
import { SourceToggle } from "./SourceToggle";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    // Auth gate: bounce home where One Tap will offer to sign in.
    redirect("/");
  }

  const sources = await listUserSettingsSources(session.user.id);
  const grouped = groupByCategory(sources);
  const customCount = sources.filter((s) => !s.isBuiltIn).length;
  const enabledCount = sources.filter((s) => s.enabled).length;

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-2 text-xs tracking-widest text-[var(--text-dim)] uppercase">
          <span>settings</span>
          <Link
            href="/"
            prefetch={false}
            className="rounded-md border border-[var(--border)] px-2 py-1 normal-case tracking-normal hover:border-sky-400/40 hover:text-sky-200"
          >
            ← Back to feed
          </Link>
        </div>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">
          Your sources
        </h1>
        <p className="text-sm text-[var(--text-dim)]">
          Signed in as <b>{session.user.name ?? session.user.email}</b>. Toggle
          anything below to scope the feed to what you actually want.
          {customCount > 0
            ? ` ${customCount} custom feed${customCount === 1 ? "" : "s"} of yours.`
            : ""}{" "}
          {enabledCount} active.
        </p>
      </header>

      <section className="mb-10">
        <AddSourceForm />
      </section>

      <section className="flex flex-col gap-6">
        {grouped.map(({ category, items }) => (
          <div
            key={category}
            className="overflow-hidden rounded-xl border border-[var(--border)]"
          >
            <h2 className="border-b border-[var(--border)] bg-[var(--bg-elev)]/60 px-4 py-2.5 text-xs font-medium tracking-widest text-[var(--text-dim)] uppercase">
              {CATEGORY_LABELS[category]}
            </h2>
            <ul>
              {items.map((src) => (
                <li
                  key={src.id}
                  className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3 last:border-b-0"
                >
                  <SourceToggle sourceId={src.id} enabled={src.enabled} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm text-[var(--text)]">
                        {src.name}
                      </span>
                      {!src.isBuiltIn && (
                        <span className="rounded-md bg-sky-400/15 px-1.5 py-0.5 text-[10px] tracking-wide text-sky-200 uppercase">
                          custom
                        </span>
                      )}
                    </div>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block truncate text-xs text-[var(--text-dim)] hover:text-sky-200"
                    >
                      {src.url}
                    </a>
                  </div>
                  {!src.isBuiltIn && (
                    <form action={removeSourceAction}>
                      <input type="hidden" name="sourceId" value={src.id} />
                      <button
                        type="submit"
                        aria-label="Remove this custom feed"
                        title="Remove"
                        className="text-xs text-[var(--text-dim)] hover:text-red-300"
                      >
                        Remove
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <footer className="mt-10 text-xs text-[var(--text-dim)]">
        Toggles are stored in the database — preferences carry across devices
        when you sign in.
      </footer>
    </main>
  );
}

function groupByCategory(
  sources: SourceWithToggle[],
): { category: Category; items: SourceWithToggle[] }[] {
  const order: Category[] = [
    "framework",
    "language",
    "browser",
    "tooling",
    "runtime",
    "platform",
    "community",
  ];
  const byCat = new Map<Category, SourceWithToggle[]>();
  for (const c of order) byCat.set(c, []);
  for (const s of sources) {
    const arr = byCat.get(s.category as Category);
    if (arr) arr.push(s);
  }
  return order
    .map((category) => ({ category, items: byCat.get(category) ?? [] }))
    .filter((g) => g.items.length > 0);
}

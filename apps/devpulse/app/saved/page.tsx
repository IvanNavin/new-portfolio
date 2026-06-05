import Link from "next/link";

import { SavedFeed } from "./SavedFeed";

export const dynamic = "force-dynamic";

export default function SavedPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-10">
        <div className="mb-3 flex items-center gap-2 text-xs tracking-widest text-[var(--text-dim)] uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300" />
          <span>saved for later</span>
        </div>
        <h1 className="mb-2 text-4xl font-semibold tracking-tight">★ Saved</h1>
        <p className="text-[var(--text-dim)]">
          Items you starred for later. Stored in your browser only — clearing
          site data drops the list.{" "}
          <Link
            href="/"
            prefetch={false}
            className="text-sky-300 hover:underline"
          >
            Back to feed →
          </Link>
        </p>
      </header>

      <SavedFeed />
    </main>
  );
}

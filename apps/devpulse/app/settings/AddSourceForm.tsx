"use client";

import { Category, CATEGORY_LABELS } from "@lib/sources";
import { useActionState, useEffect, useRef } from "react";

import { addSourceAction, AddSourceFormState } from "./actions";

const INITIAL: AddSourceFormState = {};

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][];

/**
 * Add a custom RSS/Atom URL. Uses useActionState for inline error UX —
 * if the server action rejects (bad URL, duplicate), the message appears
 * under the form without a page reload. On success the form resets and
 * the toggled list re-renders on its own thanks to revalidatePath().
 */
export function AddSourceForm() {
  const [state, action, pending] = useActionState(addSourceAction, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && formRef.current) formRef.current.reset();
  }, [state.ok]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)]/40 p-5"
    >
      <h2 className="text-sm font-medium tracking-wide text-[var(--text)]">
        Add a custom feed
      </h2>
      <p className="text-xs text-[var(--text-dim)]">
        Paste any RSS or Atom URL. Only you will see items from it.
      </p>
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <input
          name="name"
          required
          maxLength={80}
          placeholder="Name (e.g. Anthony Fu blog)"
          aria-label="Source name"
          className="rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-3 py-2 text-sm placeholder:text-[var(--text-dim)] focus-visible:border-sky-400/60 focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:outline-none"
        />
        <select
          name="category"
          aria-label="Category"
          defaultValue="community"
          className="rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-3 py-2 text-sm focus-visible:border-sky-400/60 focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:outline-none"
        >
          {CATEGORIES.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <input
        name="url"
        type="url"
        required
        placeholder="https://example.com/feed.xml"
        aria-label="Feed URL"
        className="rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-3 py-2 text-sm placeholder:text-[var(--text-dim)] focus-visible:border-sky-400/60 focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:outline-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-[var(--c-accent-fg)] bg-[var(--c-accent-soft)] px-3 py-1.5 text-sm font-medium text-[var(--c-accent-fg)] hover:brightness-110 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none"
        >
          {pending ? "Adding…" : "Add"}
        </button>
        {state.error && (
          <span className="text-xs text-red-300">{state.error}</span>
        )}
        {state.ok && (
          <span className="text-xs text-emerald-300">
            Added — the next cron will fetch it.
          </span>
        )}
      </div>
    </form>
  );
}

"use client";

import { useActionState, useRef } from "react";

import { importOpmlAction, ImportOpmlState } from "./actions";

const INITIAL: ImportOpmlState = {};

/**
 * Import OPML from another reader (Feedly, NetNewsWire, ...) by uploading
 * the file or pasting the XML. Export of the user's own subscriptions
 * lives behind /sources.opml — just a download link from here.
 *
 * Each row imported lands as a custom (isBuiltIn=false) feed owned by the
 * current user. Duplicates against the built-in list or other users'
 * adds are silently skipped.
 */
export function OpmlPanel() {
  const [state, action, pending] = useActionState(importOpmlAction, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)]/40 p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-[var(--text)]">
            Import / export OPML
          </h2>
          <p className="mt-1 text-xs text-[var(--text-dim)]">
            Pull subscriptions from any RSS reader, or back up your own.
          </p>
        </div>
        <a
          href="/sources.opml"
          className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-dim)] hover:border-sky-400/40 hover:text-sky-200"
        >
          Download my OPML
        </a>
      </div>
      <form
        ref={formRef}
        action={action}
        className="flex flex-col gap-3"
        encType="multipart/form-data"
      >
        <input
          type="file"
          name="file"
          accept=".opml,application/xml,text/xml,text/x-opml"
          className="block w-full text-xs file:mr-3 file:rounded-md file:border file:border-[var(--border)] file:bg-[var(--bg-elev)]/60 file:px-3 file:py-1.5 file:text-xs file:text-[var(--text)] file:hover:border-sky-400/40"
          aria-label="OPML file"
        />
        <details className="text-xs">
          <summary className="cursor-pointer text-[var(--text-dim)] hover:text-sky-200">
            Or paste OPML XML
          </summary>
          <textarea
            name="text"
            rows={5}
            placeholder="<opml>…</opml>"
            className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-3 py-2 font-mono text-xs placeholder:text-[var(--text-dim)] focus-visible:border-sky-400/60 focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:outline-none"
          />
        </details>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-sky-400/40 bg-sky-400/10 px-3 py-1.5 text-sm text-sky-100 hover:bg-sky-400/20 disabled:opacity-50"
          >
            {pending ? "Importing…" : "Import"}
          </button>
          {state.error && (
            <span className="text-xs text-red-300">{state.error}</span>
          )}
          {state.imported !== undefined && (
            <span className="text-xs text-emerald-300">
              Imported {state.imported}.
              {state.skipped ? ` Skipped ${state.skipped} duplicates.` : ""}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

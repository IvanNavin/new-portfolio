"use client";

import { UserMute } from "@lib/userMutes";
import { useActionState, useEffect, useRef } from "react";

import { addMuteAction, AddMuteFormState, removeMuteAction } from "./actions";

const INITIAL: AddMuteFormState = {};

/**
 * Auto-mute: substring patterns that hide items whose title or excerpt
 * matches (case-insensitive). Cheaper than regex, covers 90% of "I don't
 * want to see anything about X" use-cases.
 */
export function MutesPanel({ mutes }: { mutes: UserMute[] }) {
  const [state, action, pending] = useActionState(addMuteAction, INITIAL);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && ref.current) ref.current.reset();
  }, [state.ok]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)]/40 p-5">
      <h2 className="text-sm font-medium text-[var(--text)]">Mute patterns</h2>
      <p className="mt-1 text-xs text-[var(--text-dim)]">
        Hide any item whose title or excerpt contains one of these substrings.
        Useful for &quot;no more crypto&quot; or &quot;no more Show HN&quot;.
      </p>

      {mutes.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {mutes.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-2.5 py-1 text-xs"
            >
              <span className="text-[var(--text)]">{m.pattern}</span>
              <form action={removeMuteAction}>
                <input type="hidden" name="id" value={m.id} />
                <button
                  type="submit"
                  aria-label={`Remove mute "${m.pattern}"`}
                  className="text-[var(--text-dim)] hover:text-red-300"
                >
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form
        ref={ref}
        action={action}
        className="mt-4 flex flex-wrap items-center gap-2"
      >
        <input
          name="pattern"
          required
          maxLength={80}
          placeholder="e.g. Show HN:"
          className="flex-1 min-w-[200px] rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-3 py-2 text-sm placeholder:text-[var(--text-dim)] focus-visible:border-sky-400/60 focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-[var(--c-accent-fg)] bg-[var(--c-accent-soft)] px-3 py-1.5 text-sm font-medium text-[var(--c-accent-fg)] hover:brightness-110 disabled:opacity-50"
        >
          {pending ? "Adding…" : "Mute"}
        </button>
        {state.error && (
          <span className="text-xs text-red-300">{state.error}</span>
        )}
      </form>
    </div>
  );
}

"use client";

import { UserBoost } from "@lib/userBoosts";
import { useActionState, useEffect, useRef } from "react";

import {
  addBoostAction,
  AddBoostFormState,
  removeBoostAction,
} from "./actions";

const INITIAL: AddBoostFormState = {};

/**
 * UI for personal keyword boosts. Each row is a label + comma-separated
 * terms + weight; matches at score time. Curated boosts (lib/keywords.ts)
 * are read-only baseline — these stack on top per user.
 */
export function BoostsPanel({ boosts }: { boosts: UserBoost[] }) {
  const [state, action, pending] = useActionState(addBoostAction, INITIAL);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && ref.current) ref.current.reset();
  }, [state.ok]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)]/40 p-5">
      <h2 className="text-sm font-medium text-[var(--text)]">
        Personal keyword boosts
      </h2>
      <p className="mt-1 text-xs text-[var(--text-dim)]">
        Bump items mentioning the terms below to the top of their day bucket.
        Comma-separate the terms; weight 1–10 (default 3).
      </p>

      {boosts.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {boosts.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-3 py-2 text-sm"
            >
              <span className="rounded bg-sky-400/15 px-2 py-0.5 text-[10px] tracking-wide text-sky-200 uppercase">
                ★ {b.label}
              </span>
              <span className="text-xs text-[var(--text-dim)]">
                {b.terms.join(", ")}
              </span>
              <span className="text-xs text-[var(--text-dim)]">
                +{b.weight}
              </span>
              <form action={removeBoostAction} className="ml-auto">
                <input type="hidden" name="id" value={b.id} />
                <button
                  type="submit"
                  className="text-xs text-[var(--text-dim)] hover:text-red-300"
                  aria-label="Remove boost"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={ref} action={action} className="mt-4 flex flex-col gap-2">
        <div className="grid gap-2 sm:grid-cols-[1fr_2fr_80px]">
          <input
            name="label"
            required
            maxLength={40}
            placeholder="label (e.g. server-actions)"
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-3 py-2 text-sm placeholder:text-[var(--text-dim)] focus-visible:border-sky-400/60 focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:outline-none"
          />
          <input
            name="terms"
            required
            placeholder="server actions, useActionState"
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-3 py-2 text-sm placeholder:text-[var(--text-dim)] focus-visible:border-sky-400/60 focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:outline-none"
          />
          <input
            name="weight"
            type="number"
            min={1}
            max={10}
            defaultValue={3}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-elev)]/60 px-3 py-2 text-sm focus-visible:border-sky-400/60 focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-[var(--c-accent-fg)] bg-[var(--c-accent-soft)] px-3 py-1.5 text-sm font-medium text-[var(--c-accent-fg)] hover:brightness-110 disabled:opacity-50"
          >
            {pending ? "Adding…" : "Add boost"}
          </button>
          {state.error && (
            <span className="text-xs text-red-300">{state.error}</span>
          )}
        </div>
      </form>
    </div>
  );
}

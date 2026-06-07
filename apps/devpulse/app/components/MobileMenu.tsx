"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "./ThemeToggle";

/**
 * Hamburger collapsing every header control on small screens. The desktop
 * header stays inline (this component is hidden via sm:hidden); on phones
 * the burger button opens a small dropdown sheet with Hidden / Saved /
 * Settings / theme toggle / sign-out.
 *
 * Closes on outside click, on Escape, and on link navigation.
 */
export function MobileMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative sm:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-dim)] hover:border-sky-400/40 hover:text-sky-200 focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-60 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-2 normal-case shadow-2xl"
        >
          {session?.user && (
            <div className="mb-2 border-b border-[var(--border)] px-3 py-2 text-xs text-[var(--text-dim)]">
              Signed in as
              <div className="truncate text-sm font-medium text-[var(--text)]">
                {session.user.name ?? session.user.email}
              </div>
            </div>
          )}
          <Link
            href="/hidden"
            prefetch={false}
            onClick={() => setOpen(false)}
            role="menuitem"
            className="block rounded-md px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--c-danger-soft)] hover:text-[var(--c-danger-fg)]"
          >
            ↩ Hidden
          </Link>
          <Link
            href="/saved"
            prefetch={false}
            onClick={() => setOpen(false)}
            role="menuitem"
            className="block rounded-md px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--c-save-soft)] hover:text-[var(--c-save-fg)]"
          >
            ★ Saved
          </Link>
          {session?.user && (
            <Link
              href="/settings"
              prefetch={false}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="block rounded-md px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--c-accent-soft)] hover:text-[var(--c-accent-fg)]"
            >
              ⚙ Settings
            </Link>
          )}
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--border)] px-3 pt-2">
            <span className="text-xs text-[var(--text-dim)]">Theme</span>
            <ThemeToggle />
          </div>
          {session?.user && (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-2 w-full rounded-md border-t border-[var(--border)] px-3 py-2 pt-3 text-left text-sm font-medium text-[var(--c-danger-fg)] hover:bg-[var(--c-danger-soft)]"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </div>
  );
}

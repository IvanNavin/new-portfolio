"use client";

import {
  dismissItem,
  onStorageChange,
  readSaved,
  toggleSaved,
} from "@lib/storage";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { Tooltip } from "./Tooltip";

type Props = {
  url: string;
  title: string;
  /** Optional — wired by NewsCard to open its ReaderDrawer. Without
   *  this prop the Reader button is hidden. */
  onOpenReader?: (e: React.MouseEvent) => void;
};

async function syncSaved(url: string, saved: boolean): Promise<void> {
  try {
    await fetch("/api/saved", {
      method: saved ? "POST" : "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    /* offline / transient — best-effort */
  }
}
async function syncDismissed(url: string): Promise<void> {
  try {
    await fetch("/api/dismissed", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    /* ignore */
  }
}

/**
 * Per-card overlay. Two layouts:
 *  - Desktop (≥sm): inline icon row (share, save, hide).
 *  - Mobile (<sm): single ⋮ button that opens a dropdown with the same
 *    three actions. Reclaims the right margin so the card title and
 *    excerpt have full width on phones.
 *
 * Hide always opens an inline confirm popover regardless of layout —
 * the /hidden tab is the recovery path, but the confirm step stops
 * accidental thumb-taps from removing a story without warning.
 */
export function CardActions({ url, title, onOpenReader }: Props) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const isAuthed = Boolean(session?.user);

  useEffect(() => {
    setHydrated(true);
    setSaved(readSaved().has(url));
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
    return onStorageChange(() => {
      setSaved(readSaved().has(url));
    });
  }, [url]);

  // Close confirm + mobile menu on outside click / Escape.
  useEffect(() => {
    if (!confirmOpen && !mobileOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (
        confirmOpen &&
        confirmRef.current &&
        !confirmRef.current.contains(e.target as Node)
      ) {
        setConfirmOpen(false);
      }
      if (
        mobileOpen &&
        mobileRef.current &&
        !mobileRef.current.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [confirmOpen, mobileOpen]);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onSave = (e: React.MouseEvent) => {
    stop(e);
    const willSave = toggleSaved(url);
    setSaved(willSave);
    if (isAuthed) void syncSaved(url, willSave);
  };

  const onShare = async (e: React.MouseEvent) => {
    stop(e);
    setMobileOpen(false);
    if (navigator.share) {
      try {
        await navigator.share({ url, title });
      } catch {
        /* user dismissed the sheet — no-op */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* ignore */
      }
    }
  };

  const onDismissClick = (e: React.MouseEvent) => {
    stop(e);
    setMobileOpen(false);
    setConfirmOpen(true);
  };

  const confirmHide = (e: React.MouseEvent) => {
    stop(e);
    setConfirmOpen(false);
    const li = (e.currentTarget as HTMLElement).closest("li");
    dismissItem(url);
    if (isAuthed) void syncDismissed(url);
    if (li) {
      (li as HTMLElement).style.transition = "opacity 180ms";
      (li as HTMLElement).style.opacity = "0";
      setTimeout(() => {
        (li as HTMLElement).style.display = "none";
      }, 200);
    }
  };

  if (!hydrated) return null;

  // ── Icons ─────────────────────────────────────────────────────────
  const ShareIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
  const StarIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={saved ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  );
  const XIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
  const DotsIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  );
  const BookIcon = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );

  const ConfirmPopover = (
    <div
      ref={confirmRef}
      role="dialog"
      aria-label="Confirm hide"
      onClick={stop}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute right-0 z-40 mt-2 w-60 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-3 normal-case shadow-2xl"
    >
      <p className="mb-2 text-sm text-[var(--text)]">
        Hide this story from your feed?
      </p>
      <p className="mb-3 text-xs text-[var(--text-dim)]">
        Restore it any time from the{" "}
        <span className="font-medium text-[var(--c-danger-fg)]">Hidden</span>{" "}
        tab.
      </p>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            setConfirmOpen(false);
          }}
          className="rounded-md border border-[var(--border)] px-3 py-1 text-xs text-[var(--text)] hover:bg-[var(--bg)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirmHide}
          className="rounded-md border border-[var(--c-danger-fg)] bg-[var(--c-danger-soft)] px-3 py-1 text-xs font-medium text-[var(--c-danger-fg)] hover:brightness-110"
          autoFocus
        >
          Hide
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop: inline buttons ──────────────────────────────── */}
      <div className="absolute top-3 right-3 hidden items-center gap-1.5 sm:flex">
        {onOpenReader && (
          <Tooltip label="Read on devpulse">
            <button
              type="button"
              onClick={onOpenReader}
              aria-label="Open in reader"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text)] transition-colors hover:border-[var(--c-accent-fg)] hover:text-[var(--c-accent-fg)] focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none"
            >
              {BookIcon}
            </button>
          </Tooltip>
        )}
        {canShare && (
          <Tooltip label="Share this story">
            <button
              type="button"
              onClick={onShare}
              aria-label={`Share: ${title}`}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text)] transition-colors hover:border-[var(--c-accent-fg)] hover:text-[var(--c-accent-fg)] focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none"
            >
              {ShareIcon}
            </button>
          </Tooltip>
        )}
        <Tooltip label={saved ? "Remove from Saved" : "Save for later"}>
          <button
            type="button"
            onClick={onSave}
            aria-label={saved ? "Remove from Saved" : "Save for later"}
            aria-pressed={saved}
            className={[
              "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
              "focus-visible:ring-2 focus-visible:ring-amber-300/50 focus-visible:outline-none",
              saved
                ? "border-[var(--c-save-fg)] bg-[var(--c-save-soft)] text-[var(--c-save-fg)]"
                : "border-[var(--border)] text-[var(--text)] hover:border-[var(--c-save-fg)] hover:text-[var(--c-save-fg)]",
            ].join(" ")}
          >
            {StarIcon}
          </button>
        </Tooltip>
        <div className="relative">
          <Tooltip label="Hide">
            <button
              type="button"
              onClick={onDismissClick}
              aria-label="Hide this story"
              aria-expanded={confirmOpen}
              aria-haspopup="dialog"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text)] transition-colors hover:border-[var(--c-danger-fg)] hover:text-[var(--c-danger-fg)] focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:outline-none"
            >
              {XIcon}
            </button>
          </Tooltip>
          {confirmOpen && ConfirmPopover}
        </div>
      </div>

      {/* ── Mobile: single ⋮ button + dropdown menu ──────────────── */}
      <div className="absolute top-3 right-3 sm:hidden" ref={mobileRef}>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            setMobileOpen((v) => !v);
          }}
          aria-label="Story actions"
          aria-expanded={mobileOpen}
          aria-haspopup="menu"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text)] focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none"
        >
          {DotsIcon}
        </button>
        {mobileOpen && (
          <div
            role="menu"
            onClick={stop}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] py-1 normal-case shadow-2xl"
          >
            {onOpenReader && (
              <button
                type="button"
                onClick={(e) => {
                  setMobileOpen(false);
                  onOpenReader(e);
                }}
                role="menuitem"
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--c-accent-soft)] hover:text-[var(--c-accent-fg)]"
              >
                <span aria-hidden="true">{BookIcon}</span>
                Read on devpulse
              </button>
            )}
            {canShare && (
              <button
                type="button"
                onClick={onShare}
                role="menuitem"
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--c-accent-soft)] hover:text-[var(--c-accent-fg)]"
              >
                <span aria-hidden="true">{ShareIcon}</span>
                Share
              </button>
            )}
            <button
              type="button"
              onClick={onSave}
              role="menuitem"
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--c-save-soft)] hover:text-[var(--c-save-fg)]"
            >
              <span aria-hidden="true">{StarIcon}</span>
              {saved ? "Remove from Saved" : "Save for later"}
            </button>
            <button
              type="button"
              onClick={onDismissClick}
              role="menuitem"
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--c-danger-soft)] hover:text-[var(--c-danger-fg)]"
            >
              <span aria-hidden="true">{XIcon}</span>
              Hide
            </button>
          </div>
        )}
        {confirmOpen && ConfirmPopover}
      </div>
    </>
  );
}

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
 * Per-card client overlay: share, save, dismiss. Read-state used to live
 * here too as a manual ✓ button — the auto-mark-as-read on click made it
 * redundant.
 *
 * Dismiss now opens an inline confirm popover instead of firing a toast
 * with undo: users asked for an explicit "are you sure?" prompt before
 * removing a story from the feed. The /hidden tab is the recovery path
 * if they change their mind later.
 */
export function CardActions({ url, title }: Props) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);
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

  // Close confirm when clicking outside or pressing Escape.
  useEffect(() => {
    if (!confirmOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (
        confirmRef.current &&
        !confirmRef.current.contains(e.target as Node)
      ) {
        setConfirmOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [confirmOpen]);

  const onSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const willSave = toggleSaved(url);
    setSaved(willSave);
    if (isAuthed) void syncSaved(url, willSave);
  };

  const onShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const confirmHide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    <div className="absolute top-3 right-3 flex items-center gap-1.5">
      {canShare && (
        <Tooltip label="Share this story">
          <button
            type="button"
            onClick={onShare}
            aria-label={`Share: ${title}`}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-dim)] transition-colors hover:border-sky-400/40 hover:text-sky-200 focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none"
          >
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
              ? "border-amber-300/60 bg-amber-300/15 text-amber-200 hover:bg-amber-300/25"
              : "border-[var(--border)] text-[var(--text-dim)] hover:border-amber-300/40 hover:text-amber-200",
          ].join(" ")}
        >
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
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-dim)] transition-colors hover:border-red-400/40 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:outline-none"
          >
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
          </button>
        </Tooltip>
        {confirmOpen && (
          <div
            ref={confirmRef}
            role="dialog"
            aria-label="Confirm hide"
            // Stop the document-level ReadOnClick handler from firing
            // when interacting with the popover.
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute right-0 z-40 mt-2 w-60 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-3 normal-case shadow-2xl"
          >
            <p className="mb-3 text-sm text-[var(--text)]">
              Hide this story from your feed?
            </p>
            <p className="mb-3 text-xs text-[var(--text-dim)]">
              You can bring it back from the{" "}
              <span className="text-red-300">Hidden</span> tab.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmOpen(false);
                }}
                className="rounded-md border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-dim)] hover:text-[var(--text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmHide}
                className="rounded-md border border-red-400/60 bg-red-400/15 px-3 py-1 text-xs font-medium text-red-100 hover:bg-red-400/25"
                autoFocus
              >
                Hide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

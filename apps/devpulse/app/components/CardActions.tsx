"use client";

import {
  dismissItem,
  onStorageChange,
  readDismissed,
  readReadSet,
  readSaved,
  toggleRead,
  toggleSaved,
  undismissItem,
} from "@lib/storage";
import { showToast } from "@lib/toasts";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Props = {
  url: string;
  title: string;
};

/**
 * Write-through to the DB when authenticated. Fire-and-forget — the
 * localStorage write already happened so the UI doesn't wait.
 */
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
async function syncUndismissed(url: string): Promise<void> {
  try {
    await fetch("/api/dismissed", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    /* ignore */
  }
}
async function syncRead(url: string, isRead: boolean): Promise<void> {
  try {
    await fetch("/api/read", {
      method: isRead ? "POST" : "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    /* ignore */
  }
}

/**
 * Per-card client overlay: share, save, dismiss. The NEW pill lives in
 * the meta row (NewBadge component) so the overlay doesn't compete with
 * the time-ago label.
 *
 * Dismiss fires a toast with Undo — that 5-second window covers the
 * "oops, wrong card" case without making dismiss feel scary.
 */
export function CardActions({ url, title }: Props) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [read, setRead] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const isAuthed = Boolean(session?.user);

  useEffect(() => {
    setHydrated(true);
    setSaved(readSaved().has(url));
    setRead(readReadSet().has(url));
    setCanShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
    return onStorageChange(() => {
      setSaved(readSaved().has(url));
      setRead(readReadSet().has(url));
    });
  }, [url]);

  const onSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const willSave = toggleSaved(url);
    setSaved(willSave);
    if (isAuthed) void syncSaved(url, willSave);
  };

  const onToggleRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const willRead = toggleRead(url);
    setRead(willRead);
    if (isAuthed) void syncRead(url, willRead);
    // Apply desaturation immediately for snappy feedback; the next
    // server-render will scope it via data-read on the wrapping <li>.
    const card = (e.currentTarget as HTMLElement).closest("a[data-card-url]");
    if (card instanceof HTMLElement) {
      card.dataset.read = willRead ? "true" : "";
    }
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
        showToast({ message: "Link copied to clipboard." });
      } catch {
        showToast({ message: "Couldn't copy link." });
      }
    }
  };

  const onDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

    showToast({
      message: "Hidden.",
      undo: () => {
        // Pull URL out of the (already-modified) dismissed set and revive
        // the card. The state revert is permanent — even if the toast
        // auto-dismisses later, the user gets one shot at Undo.
        if (readDismissed().has(url)) {
          undismissItem(url);
          if (isAuthed) void syncUndismissed(url);
        }
        if (li) {
          (li as HTMLElement).style.display = "";
          (li as HTMLElement).style.opacity = "1";
        }
      },
    });
  };

  if (!hydrated) return null;

  return (
    <div className="absolute top-3 right-3 flex items-center gap-1.5">
      <button
        type="button"
        onClick={onToggleRead}
        aria-label={read ? "Mark as unread" : "Mark as read"}
        aria-pressed={read}
        title={read ? "Read — click to unread" : "Mark as read"}
        className={[
          "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
          "focus-visible:ring-2 focus-visible:ring-emerald-300/50 focus-visible:outline-none",
          read
            ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25"
            : "border-[var(--border)] text-[var(--text-dim)] hover:border-emerald-400/40 hover:text-emerald-200",
        ].join(" ")}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
      {canShare && (
        <button
          type="button"
          onClick={onShare}
          aria-label="Share"
          title="Share"
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
      )}
      <button
        type="button"
        onClick={onSave}
        aria-label={saved ? "Unsave" : "Save for later"}
        aria-pressed={saved}
        title={saved ? "Saved" : "Save"}
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
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Hide"
        title="Hide (with undo)"
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
    </div>
  );
}

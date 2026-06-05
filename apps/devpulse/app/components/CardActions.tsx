"use client";

import { useEffect, useState } from "react";

import {
  dismissItem,
  onStorageChange,
  readSaved,
  toggleSaved,
} from "@lib/storage";

type Props = {
  url: string;
  publishedAtIso: string;
};

/**
 * Per-card client overlay: save star, dismiss ×, and the NEW pill.
 *
 * Reads localStorage on mount. Keeps in sync with other CardActions on the
 * page (e.g. when you save from Saved view) via the custom storage event.
 *
 * The component renders a small toolbar absolutely positioned inside the
 * card. We `e.preventDefault()` on the wrapping `<a>` only for the action
 * buttons — the rest of the card link still opens the story.
 */
export function CardActions({ url, publishedAtIso }: Props) {
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setSaved(readSaved().has(url));
    // NEW = published since previous visit. lastVisit is read+written once
    // per page mount by PostMountFilters; here we just compare.
    try {
      const lastVisit = parseInt(
        localStorage.getItem("devpulse.lastVisit.prev") ?? "0",
        10,
      );
      if (lastVisit > 0) {
        const pub = new Date(publishedAtIso).getTime();
        setIsNew(pub > lastVisit);
      }
    } catch {
      /* ignore */
    }
    return onStorageChange(() => {
      setSaved(readSaved().has(url));
    });
  }, [url, publishedAtIso]);

  const onSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const willSave = toggleSaved(url);
    setSaved(willSave);
  };

  const onDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissItem(url);
    // Fade the card out — PostMountFilters will hide it on next paint.
    const li = (e.currentTarget as HTMLElement).closest("li");
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
      {isNew && (
        <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-300 uppercase">
          new
        </span>
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
        aria-label="Hide forever"
        title="Hide forever"
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

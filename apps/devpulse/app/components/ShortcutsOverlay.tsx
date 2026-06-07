"use client";

import { useEffect, useState } from "react";

/**
 * "?" opens a small help overlay listing keyboard shortcuts.
 * Escape (or click backdrop) closes it. Inert when typing in an input
 * so the search field still accepts literal "?" characters.
 */
const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "j", label: "Next story" },
  { keys: "k", label: "Previous story" },
  { keys: "Enter", label: "Open focused story" },
  { keys: "s", label: "Save / unsave focused story" },
  { keys: "e", label: "Hide focused story" },
  { keys: "/", label: "Focus the search box" },
  { keys: "g h", label: "Go to home feed" },
  { keys: "g s", label: "Go to ★ Saved" },
  { keys: "g t", label: "Go to /settings" },
  { keys: "t", label: "Toggle light / dark" },
  { keys: "?", label: "Show this help" },
  { keys: "Esc", label: "Close overlays" },
];

export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (open && e.key === "Escape") {
        setOpen(false);
        e.preventDefault();
        return;
      }
      if (inField) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        setOpen(true);
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="text-[var(--text-dim)] hover:text-[var(--text)]"
          >
            ×
          </button>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="contents">
              <dt className="font-mono text-xs text-sky-200">
                {s.keys.split(" ").map((k, i, arr) => (
                  <span key={i}>
                    <kbd className="rounded border border-[var(--border)] bg-white/5 px-1.5 py-0.5">
                      {k}
                    </kbd>
                    {i < arr.length - 1 ? " then " : ""}
                  </span>
                ))}
              </dt>
              <dd className="text-[var(--text-dim)]">{s.label}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-xs text-[var(--text-dim)]">
          Press{" "}
          <kbd className="rounded border border-[var(--border)] bg-white/5 px-1 py-0.5">
            Esc
          </kbd>{" "}
          to close.
        </p>
      </div>
    </div>
  );
}

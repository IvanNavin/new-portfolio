"use client";

import { Toast, TOAST_EVENT } from "@lib/toasts";
import { useCallback, useEffect, useState } from "react";

/**
 * Bottom-of-screen toast stack. Mounted once in the root layout.
 * Toasts auto-dismiss after their duration; clicking "Undo" cancels the
 * dismissal AND runs the callback so the source state can be restored.
 *
 * A thin progress bar across the bottom of each toast visually counts
 * down the undo window so users see how much time they have left to
 * react.
 */
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    function handler(e: Event) {
      const toast = (e as CustomEvent<Toast>).detail;
      setToasts((cur) => [...cur, toast]);
      if (toast.durationMs && toast.durationMs > 0) {
        setTimeout(() => remove(toast.id), toast.durationMs);
      }
    }
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, [remove]);

  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto relative flex w-full max-w-md items-center gap-3 overflow-hidden rounded-lg border border-sky-400/40 bg-[var(--bg-elev)] px-4 py-3 text-sm shadow-2xl shadow-black/40"
          role="status"
          aria-live="polite"
        >
          <span className="flex-1 text-[var(--text)]">{t.message}</span>
          {t.undo && (
            <button
              type="button"
              onClick={() => {
                t.undo?.();
                remove(t.id);
              }}
              className="rounded-md border border-sky-400/40 bg-sky-400/15 px-3 py-1 text-sm font-medium text-sky-100 hover:bg-sky-400/25 focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none"
            >
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={() => remove(t.id)}
            aria-label="Dismiss notification"
            className="text-[var(--text-dim)] hover:text-[var(--text)]"
          >
            ×
          </button>
          {/* Progress bar — animated by CSS keyframe matched to durationMs */}
          {t.durationMs ? (
            <span
              aria-hidden="true"
              className="absolute right-0 bottom-0 left-0 h-0.5 origin-left bg-sky-400/50"
              style={{
                animation: `toastCountdown ${t.durationMs}ms linear forwards`,
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

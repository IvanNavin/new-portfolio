"use client";

import { Toast, TOAST_EVENT } from "@lib/toasts";
import { useCallback, useEffect, useState } from "react";

/**
 * Bottom-of-screen toast stack. Mounted once in the root layout.
 * Toasts auto-dismiss after their duration; clicking "Undo" cancels the
 * dismissal AND runs the callback so the source state can be restored.
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
          className="pointer-events-auto flex max-w-md items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-4 py-2.5 text-sm shadow-lg shadow-black/30"
          role="status"
        >
          <span className="flex-1 text-[var(--text)]">{t.message}</span>
          {t.undo && (
            <button
              type="button"
              onClick={() => {
                t.undo?.();
                remove(t.id);
              }}
              className="text-sky-300 underline-offset-4 hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:outline-none"
            >
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={() => remove(t.id)}
            aria-label="Dismiss"
            className="text-[var(--text-dim)] hover:text-[var(--text)]"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

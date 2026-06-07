/**
 * Tiny client-side toast bus. The Toaster component subscribes to
 * window-dispatched events; anywhere in the tree can fire showToast()
 * without prop-drilling or context.
 *
 * Action toasts include an optional undo callback that runs when the
 * user clicks the "Undo" link before the toast auto-dismisses.
 */

export type Toast = {
  id: string;
  message: string;
  undo?: () => void;
  durationMs?: number;
};

export const TOAST_EVENT = "devpulse:toast";

export function showToast(toast: Omit<Toast, "id">): void {
  if (typeof window === "undefined") return;
  const full: Toast = {
    id: Math.random().toString(36).slice(2, 10),
    // 8s default — long enough that a thumb-on-phone user has time to
    // notice the Undo button and react, but short enough that a stack
    // of toasts doesn't pile up.
    durationMs: 8000,
    ...toast,
  };
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: full }));
}

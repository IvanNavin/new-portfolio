/**
 * A window-event bus instead of a context provider: a toast can be fired from
 * anywhere (including non-React code) without threading a setter through the
 * tree. Same trick as devpulse's lib/toasts.ts.
 */
export type ToastTone = 'xp' | 'rank' | 'info' | 'danger';

export type Toast = {
  id: number;
  tone: ToastTone;
  title: string;
  detail?: string;
};

const EVENT = 'devops-quest:toast';

let counter = 0;

export const toast = (
  tone: ToastTone,
  title: string,
  detail?: string,
): void => {
  if (typeof window === 'undefined') return;
  counter += 1;
  window.dispatchEvent(
    new CustomEvent<Toast>(EVENT, {
      detail: { id: counter, tone, title, detail },
    }),
  );
};

export const subscribeToasts = (
  listener: (toast: Toast) => void,
): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const handler = (event: Event) =>
    listener((event as CustomEvent<Toast>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};

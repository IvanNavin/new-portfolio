'use client';
import { useEffect } from 'react';

/**
 * Registers the service worker on mount. No UI — runs once on the
 * client and stays out of SSR. Failures are intentionally swallowed:
 * the site works fine without a SW, this just adds installability +
 * offline fallback on top.
 */
export const PWARegister = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Avoid registering SW during local dev to keep HMR snappy and
    // prevent stale precaches surviving across builds. Vercel sets
    // NEXT_PUBLIC_VERCEL_ENV; locally it's undefined.
    const isProd =
      process.env.NODE_ENV === 'production' &&
      process.env.NEXT_PUBLIC_VERCEL_ENV !== 'preview';
    if (!isProd) return;

    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        /* SW is best-effort — never block the page. */
      });
    };
    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad, { once: true });
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);

  return null;
};

"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on mount. No UI — runs once on the client
 * and stays out of SSR. Failures are swallowed: the site works fine
 * without a SW, this just adds installability + offline shell on top.
 *
 * Dev-mode registration is skipped to keep HMR fast and avoid leftover
 * precaches surviving across rebuilds.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* best-effort */
      });
    };
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return null;
}

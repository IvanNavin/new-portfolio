/* devpulse service worker.
 *
 * Strategy:
 *  - HTML navigations: network-first, fall back to last cached HTML,
 *    then to /offline.html if nothing cached. Keeps you reading the
 *    last feed snapshot when the train hits a tunnel.
 *  - Static assets (_next, /icons, manifest): stale-while-revalidate.
 *  - /api/*: always network. Never cache feed data — staleness here
 *    would defeat the entire point of the app.
 *
 * Bump VERSION when sw.js or the shell asset list changes.
 */
const VERSION = "v1";
const SHELL_CACHE = `devpulse-shell-${VERSION}`;
const RUNTIME_CACHE = `devpulse-runtime-${VERSION}`;

const SHELL_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then(async (cache) => {
        await Promise.all(
          SHELL_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              // Missing asset on first install must not abort SW activation.
              // eslint-disable-next-line no-console
              console.warn("[devpulse-sw] skipped precache for", url, err);
            }),
          ),
        );
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  const isHtml =
    request.mode === "navigate" ||
    request.headers.get("accept")?.includes("text/html");

  if (isHtml) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          // Cache the last successful HTML so offline reads have something
          // recent to fall back to. Cap by always overwriting the same key.
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put("/", fresh.clone()).catch(() => {});
          return fresh;
        } catch {
          const cachedHome = await caches.match("/");
          if (cachedHome) return cachedHome;
          return (await caches.match("/offline.html")) || Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => undefined);
      return cached || (await networkFetch) || Response.error();
    })(),
  );
});

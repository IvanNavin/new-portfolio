/* Service worker for Ivan Holovko's portfolio.
 *
 * Caching strategy is intentionally minimal — only the three pages
 * the visitor is most likely to want offline are precached:
 *
 *   - / (home)
 *   - /en/about (About Me)
 *   - /cv/Ivan_Holovko_CV.pdf (the actual CV file)
 *
 * Plus the install-time essentials (offline fallback, manifest,
 * icons). Any other navigation that fails offline shows the
 * `/offline` page instead of trying to serve a possibly-stale or
 * partially-cached resource — clearer signal to the user that
 * they're not online.
 *
 * Static assets (CSS / JS / images / fonts) still use
 * stale-while-revalidate so repeat visits are instant.
 *
 * Bump VERSION whenever the precache list changes — old caches are
 * cleaned up on activate.
 */
const VERSION = 'v2';
const SHELL_CACHE = `shell-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const SHELL_ASSETS = [
  '/',
  '/en',
  '/en/about',
  '/cv/Ivan_Holovko_CV.pdf',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then(async (cache) => {
        // Use individual add() with catch so one missing entry (e.g.
        // /cv hasn't been deployed yet) doesn't fail the whole install.
        await Promise.all(
          SHELL_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Skipped precache for ${url}:`, err);
            }),
          ),
        );
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
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

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache the visit-tracking endpoint or any API call.
  if (url.pathname.startsWith('/api/')) return;

  // Cross-origin requests: leave to the browser.
  if (url.origin !== self.location.origin) return;

  // HTML / navigation: network-first, fall back to cache, then to
  // the offline page if the page wasn't pre-cached.
  if (
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html')
  ) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          // Strip lang prefix and trailing slashes, then look up
          // the bare path too — covers the case where /uk/about is
          // requested but we only cached /en/about.
          return (await caches.match('/offline')) || Response.error();
        }
      })(),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
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

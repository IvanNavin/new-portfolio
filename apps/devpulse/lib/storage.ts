/**
 * Tiny client-only localStorage layer for personal feed state.
 *
 * Keys live under `devpulse.*` so they never collide with other apps on
 * the same origin. Reads guard against SSR (typeof window === 'undefined')
 * AND quota / disabled-storage errors — a corrupted entry never crashes
 * the page, it just resets to empty.
 */

const KEYS = {
  saved: "devpulse.saved",
  dismissed: "devpulse.dismissed",
  lastVisit: "devpulse.lastVisit",
} as const;

const STORAGE_EVENT = "devpulse:storage";

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
    // Same-tab notification so other hooks listening for changes refresh.
    // The native `storage` event only fires cross-tab.
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
  } catch {
    // quota exceeded, private mode, etc — silently no-op
  }
}

function readSet(key: string): Set<string> {
  const raw = safeGet(key);
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr)
      ? new Set(arr.filter((x) => typeof x === "string"))
      : new Set();
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>): void {
  safeSet(key, JSON.stringify([...set]));
}

// ---- Saved ----------------------------------------------------------------

export function readSaved(): Set<string> {
  return readSet(KEYS.saved);
}

export function toggleSaved(url: string): boolean {
  const set = readSet(KEYS.saved);
  const willSave = !set.has(url);
  if (willSave) set.add(url);
  else set.delete(url);
  writeSet(KEYS.saved, set);
  return willSave;
}

// ---- Dismissed ------------------------------------------------------------

export function readDismissed(): Set<string> {
  return readSet(KEYS.dismissed);
}

export function dismissItem(url: string): void {
  const set = readSet(KEYS.dismissed);
  set.add(url);
  writeSet(KEYS.dismissed, set);
}

export function undismissItem(url: string): void {
  const set = readSet(KEYS.dismissed);
  set.delete(url);
  writeSet(KEYS.dismissed, set);
}

// ---- Last visit -----------------------------------------------------------

/**
 * Returns the previously-stamped lastVisit (ms epoch) and immediately writes
 * a fresh timestamp for next time. NEW-pill logic compares item.publishedAt
 * against the returned value — so the very first visit shows no pills, and
 * each subsequent visit highlights what arrived since the prior one.
 */
export function readAndBumpLastVisit(): number {
  const prev = parseInt(safeGet(KEYS.lastVisit) ?? "0", 10) || 0;
  safeSet(KEYS.lastVisit, String(Date.now()));
  return prev;
}

// ---- Cross-component reactivity ------------------------------------------

export function onStorageChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const native = () => handler();
  const custom = () => handler();
  window.addEventListener("storage", native);
  window.addEventListener(STORAGE_EVENT, custom as EventListener);
  return () => {
    window.removeEventListener("storage", native);
    window.removeEventListener(STORAGE_EVENT, custom as EventListener);
  };
}

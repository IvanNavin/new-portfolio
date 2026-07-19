/**
 * SSRF guard for any server-side fetch where the URL comes (even
 * indirectly) from user input — favicon proxy, RSS feed fetcher,
 * auto-discovery, OPML import.
 *
 * Without this an attacker can pass
 *   /api/favicon?host=169.254.169.254
 * and we'd happily fetch the Vercel internal metadata endpoint,
 * possibly leaking IAM credentials in the response headers. Same
 * shape via a custom RSS source URL that points at localhost or a
 * private VPC IP.
 *
 * What we block:
 *  - localhost / loopback aliases
 *  - private IPv4 ranges (RFC1918)
 *  - link-local + cloud metadata (169.254.0.0/16)
 *  - IPv6 loopback + unique-local + link-local
 *  - Hostnames ending in .local / .internal / .lan
 *  - Numeric IPs in dotted-decimal, octal, or integer form
 *
 * Not blocked: actual DNS resolution. A malicious DNS that points
 * example.com at 127.0.0.1 ("DNS rebinding") would slip past this
 * check. For the threat model — a hobby aggregator with one user —
 * that's acceptable. A full SSRF defence would resolve DNS, check
 * the resolved IP, then fetch with that IP pinned. Overkill here.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "ip6-localhost",
  "ip6-loopback",
  "broadcasthost",
]);

const BLOCKED_SUFFIXES = [".local", ".internal", ".lan", ".localhost"];

// Parse one IPv4 part: decimal, octal (0-prefix) or hex (0x-prefix), as inet_aton does.
function parseIPv4Part(p: string): number | null {
  if (p === "") return null;
  let n: number;
  if (/^0x[0-9a-f]+$/i.test(p)) n = parseInt(p, 16);
  else if (/^0[0-7]+$/.test(p)) n = parseInt(p, 8);
  else if (/^[0-9]+$/.test(p)) n = parseInt(p, 10);
  else return null;
  return Number.isFinite(n) ? n : null;
}

// Expand an IPv4 literal (incl. shorthand "127.1", integer "2130706433", hex)
// into 4 octets like the OS resolver; null if not numeric IPv4. Without this,
// "127.1" slips a naive 4-octet check yet resolves to 127.0.0.1 → SSRF.
function ipv4ToOctets(host: string): number[] | null {
  const parts = host.split(".");
  if (parts.length < 1 || parts.length > 4) return null;
  const nums: number[] = [];
  for (const p of parts) {
    const n = parseIPv4Part(p);
    if (n === null) return null;
    nums.push(n);
  }
  const k = nums.length;
  // Every part except the last must fit in a single byte.
  for (let i = 0; i < k - 1; i++) {
    if (nums[i] > 255) return null;
  }
  // The final part absorbs all remaining bytes (5 - k of them, big-endian).
  const lastBytes = 5 - k;
  const last = nums[k - 1];
  if (last < 0 || last > Math.pow(256, lastBytes) - 1) return null;
  const octets = nums.slice(0, k - 1);
  for (let i = lastBytes - 1; i >= 0; i--) {
    octets.push((last >>> (i * 8)) & 255);
  }
  return octets;
}

function isPrivateIPv4(host: string): boolean {
  const octets = ipv4ToOctets(host);
  if (!octets) return false;
  const [a, b] = octets;
  // 0.0.0.0/8
  if (a === 0) return true;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 127.0.0.0/8 — loopback
  if (a === 127) return true;
  // 169.254.0.0/16 — link-local + cloud metadata
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  // 224.0.0.0/4 — multicast
  if (a >= 224 && a <= 239) return true;
  // 240.0.0.0/4 — reserved
  if (a >= 240) return true;
  return false;
}

function isPrivateIPv6(host: string): boolean {
  // Strip brackets from URL form, normalize lowercase.
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "::" || h === "::1") return true;
  // fe80::/10 — link-local
  if (
    h.startsWith("fe8") ||
    h.startsWith("fe9") ||
    h.startsWith("fea") ||
    h.startsWith("feb")
  )
    return true;
  // fc00::/7 — unique-local
  if (h.startsWith("fc") || h.startsWith("fd")) return true;
  // ::ffff:127.0.0.1 etc — v4-mapped onto v6
  if (h.startsWith("::ffff:")) {
    const v4 = h.slice("::ffff:".length);
    return isPrivateIPv4(v4);
  }
  return false;
}

export function isBlockedHost(host: string): boolean {
  if (!host) return true;
  const lower = host.toLowerCase().trim();
  if (BLOCKED_HOSTNAMES.has(lower)) return true;
  if (BLOCKED_SUFFIXES.some((suf) => lower.endsWith(suf))) return true;
  if (isPrivateIPv4(lower)) return true;
  if (lower.includes(":") && isPrivateIPv6(lower)) return true;
  // Single decimal/hex form (e.g. ?host=2130706433 == 127.0.0.1) —
  // a pure number can't be a valid public hostname; reject.
  if (/^(0x)?[0-9a-f]+$/i.test(lower) && !/[.\-]/.test(lower)) {
    return true;
  }
  return false;
}

/** Parse a URL and reject if its host is private/blocked. Returns the
 *  parsed URL on success so the caller can `fetch(parsed.toString())`. */
export function assertSafeUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    throw new Error("URL must be http(s)");
  }
  if (isBlockedHost(u.hostname)) {
    throw new Error("Host is not reachable from this server");
  }
  return u;
}

const MAX_REDIRECTS = 5;

/** SSRF-safe fetch: rejects private targets AND re-validates every redirect hop
 *  (redirect:"follow" would let a public URL 302 to 169.254.169.254). */
export async function safeFetch(
  raw: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const { timeoutMs = 5000, ...rest } = init ?? {};
  const signal = AbortSignal.timeout(timeoutMs);

  let current = assertSafeUrl(raw);
  for (let hop = 0; ; hop++) {
    const res = await fetch(current.toString(), {
      ...rest,
      signal,
      redirect: "manual",
    });

    const location =
      res.status >= 300 && res.status < 400
        ? res.headers.get("location")
        : null;
    if (!location) return res;

    if (hop >= MAX_REDIRECTS) {
      throw new Error("Too many redirects");
    }
    // Re-check each redirect target's host before following it.
    current = assertSafeUrl(new URL(location, current).toString());
  }
}

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

function isPrivateIPv4(host: string): boolean {
  // Match dotted decimal, also octal (0177.0.0.1 style) by reading raw octets.
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  const octets = parts.map((p) => {
    // Parse with auto-base so 0177 reads as 127.
    const n = p.startsWith("0") && p.length > 1 ? parseInt(p, 8) : Number(p);
    return Number.isFinite(n) && n >= 0 && n <= 255 ? n : NaN;
  });
  if (octets.some((n) => Number.isNaN(n))) return false;
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

/** Fetch wrapper that rejects private-network targets before sending. */
export async function safeFetch(
  raw: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const url = assertSafeUrl(raw);
  const { timeoutMs = 5000, ...rest } = init ?? {};
  return fetch(url.toString(), {
    ...rest,
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  });
}

/**
 * Source-of-truth for Contact page links + the Cal.com booking
 * handle. Keep this co-located with the page so the Cal.com slug,
 * email, and social handles can all be updated in a single file
 * without grepping templates.
 *
 * TODO(Ivan):
 *   1. Register at https://cal.com (free plan covers the use case —
 *      unlimited event types, no "Powered by" banner).
 *   2. Pick a username (the link below assumes the same `ivanholovko`
 *      handle you use on Calendly; change if cal.com is taken).
 *   3. Connect Google/Outlook/iCloud calendar so cal.com pulls real
 *      availability.
 *   4. Create or rename the 30-min event-type slug to match `30min`
 *      below — or update the constant to your actual slug.
 */

/**
 * Cal.com booking handle.
 *
 * Two forms supported:
 *   • `<username>` (current) — renders the visitor's profile page
 *     with all active event types listed. They pick one, then book.
 *     Best when you publish multiple durations (30m / 60m / 90m...)
 *     and want the visitor to self-select.
 *   • `<username>/<event-slug>` — jumps straight to the calendar
 *     for that specific event. Use when there's a single canonical
 *     CTA ("book a 30-min chat") and you don't want a picker.
 *
 * Note the dash: Cal.com normalizes handles to URL-safe slugs, so
 * `ivanholovko` got registered as `ivan-holovko`.
 */
export const CAL_BOOKING_LINK = 'ivan-holovko';

/**
 * Cal.com instance origin. The free EU tier (`cal.eu`) is where the
 * account lives — EU data residency. Embed.js routes its iframe to
 * this origin to talk to the right backend. Override only if you
 * later migrate to the US instance (`cal.com`) or self-host.
 */
export const CAL_ORIGIN = 'https://cal.eu';

/**
 * Cal.com embed loader. The EU instance ships its own copy at
 * `app.cal.eu`; using the cal.com URL would 404 for EU accounts.
 */
export const CAL_EMBED_SCRIPT_SRC = 'https://app.cal.eu/embed/embed.js';

/**
 * Direct contact addresses. The Cal.com call is the preferred CTA
 * but some folks prefer email/DM — these surface alongside.
 *
 * TODO(Ivan): replace `ivan.holovko@example.com` with the real
 * inbox once you decide which one to advertise publicly.
 */
export const CONTACT_EMAIL = 'ivan.holovko@example.com';
export const CONTACT_LINKEDIN = 'https://www.linkedin.com/in/holovkoivan/';
export const CONTACT_GITHUB = 'https://github.com/IvanNavin';

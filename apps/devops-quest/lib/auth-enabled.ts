/**
 * Sign-in exists only to sync progress across devices, so it is switched on by
 * configuration rather than always mounted. Without a Google client id there is
 * nothing to sign in with — and mounting Auth.js anyway makes every page fetch
 * /api/auth/session and get a 500 back, which is noise in the console and a
 * broken-looking app for anyone running it locally.
 */
export const SIGN_IN_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
);

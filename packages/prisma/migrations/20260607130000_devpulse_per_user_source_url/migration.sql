-- Replace the global url UNIQUE constraint on devpulse_source with two
-- partial uniqueness rules so the same URL can appear once per user
-- without leaking that someone else already added it.
--
-- After the migration:
--   * Built-in sources stay globally URL-unique (only one curated row per URL).
--   * User-added sources are URL-unique PER user — User A's "MyBlog"
--     row coexists with User B's row pointing at the same URL.
--
-- Plain @@index([url]) gives the planner a way to look up by URL when
-- the cron dedupes fetches across all source rows.

ALTER TABLE "devpulse_source" DROP CONSTRAINT IF EXISTS "devpulse_source_url_key";

DROP INDEX IF EXISTS "devpulse_source_url_key";

CREATE UNIQUE INDEX "devpulse_source_builtin_url_key"
  ON "devpulse_source" ("url")
  WHERE "isBuiltIn" = TRUE;

CREATE UNIQUE INDEX "devpulse_source_user_url_key"
  ON "devpulse_source" ("createdByUserId", "url")
  WHERE "isBuiltIn" = FALSE AND "createdByUserId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "devpulse_source_url_idx"
  ON "devpulse_source" ("url");

-- Reader mode cache, cross-source clustering, and dead-source health
-- tracking. All columns are nullable / default-zero so the migration
-- is forward-compatible without data backfill.

ALTER TABLE "devpulse_news_item"
  ADD COLUMN "cleanedHtml" TEXT,
  ADD COLUMN "referrers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "devpulse_source"
  ADD COLUMN "failureCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "disabledAt" TIMESTAMP(3);

-- Store pre-releases instead of stripping them. Per-user showPreReleases
-- pref decides whether to surface them at view time. Existing rows are
-- all real releases (the old cron stripped pre-releases at ingest), so
-- they keep isPreRelease=false by default.

-- AlterTable
ALTER TABLE "devpulse_news_item" ADD COLUMN "isPreRelease" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "devpulse_news_item_isPreRelease_publishedAt_idx" ON "devpulse_news_item"("isPreRelease", "publishedAt" DESC);

-- AlterTable
ALTER TABLE "devpulse_user" ADD COLUMN "showPreReleases" BOOLEAN NOT NULL DEFAULT false;

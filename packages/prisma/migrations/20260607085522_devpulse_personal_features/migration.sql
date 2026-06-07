-- Schema additions for the personal-features batch:
--   * news_item engagement (HN points, Lobsters score) + tags array
--   * devpulse_keyword_boost / devpulse_mute / devpulse_read_item

-- AlterTable
ALTER TABLE "devpulse_news_item"
  ADD COLUMN "engagement" INTEGER,
  ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "devpulse_news_item_engagement_idx" ON "devpulse_news_item"("engagement" DESC);

-- CreateTable
CREATE TABLE "devpulse_keyword_boost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "terms" TEXT[],
    "weight" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "devpulse_keyword_boost_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "devpulse_keyword_boost_userId_idx" ON "devpulse_keyword_boost"("userId");
ALTER TABLE "devpulse_keyword_boost"
  ADD CONSTRAINT "devpulse_keyword_boost_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "devpulse_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "devpulse_mute" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "devpulse_mute_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "devpulse_mute_userId_idx" ON "devpulse_mute"("userId");
ALTER TABLE "devpulse_mute"
  ADD CONSTRAINT "devpulse_mute_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "devpulse_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "devpulse_read_item" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "devpulse_read_item_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "devpulse_read_item_userId_url_key" ON "devpulse_read_item"("userId", "url");
CREATE INDEX "devpulse_read_item_userId_readAt_idx" ON "devpulse_read_item"("userId", "readAt" DESC);
ALTER TABLE "devpulse_read_item"
  ADD CONSTRAINT "devpulse_read_item_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "devpulse_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

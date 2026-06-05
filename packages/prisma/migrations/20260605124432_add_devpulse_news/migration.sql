-- CreateTable
CREATE TABLE "devpulse_news_item" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devpulse_news_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devpulse_news_item_url_key" ON "devpulse_news_item"("url");

-- CreateIndex
CREATE INDEX "devpulse_news_item_publishedAt_idx" ON "devpulse_news_item"("publishedAt" DESC);

-- CreateIndex
CREATE INDEX "devpulse_news_item_category_publishedAt_idx" ON "devpulse_news_item"("category", "publishedAt" DESC);

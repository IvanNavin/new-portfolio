-- AI-generated TLDR column for each news item. Nullable on purpose —
-- the helper short-circuits when GOOGLE_GENERATIVE_AI_API_KEY isn't
-- configured and we backfill existing rows lazily.

ALTER TABLE "devpulse_news_item" ADD COLUMN "summary" TEXT;

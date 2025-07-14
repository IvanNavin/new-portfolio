-- CreateTable
CREATE TABLE "visit_stat" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "timeZone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "referrer" TEXT,
    "language" TEXT,
    "deviceType" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "event" TEXT NOT NULL DEFAULT 'pageview',
    "extra" JSONB,

    CONSTRAINT "visit_stat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visit_stat_domain_path_timestamp_idx" ON "visit_stat"("domain", "path", "timestamp");

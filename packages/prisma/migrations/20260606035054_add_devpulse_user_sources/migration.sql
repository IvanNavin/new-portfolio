-- CreateTable
CREATE TABLE "devpulse_source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 5,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devpulse_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devpulse_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "lastVisitAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devpulse_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devpulse_user_source_pref" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "devpulse_user_source_pref_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devpulse_saved_item" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devpulse_saved_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devpulse_dismissed_item" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devpulse_dismissed_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devpulse_source_url_key" ON "devpulse_source"("url");

-- CreateIndex
CREATE INDEX "devpulse_source_isBuiltIn_idx" ON "devpulse_source"("isBuiltIn");

-- CreateIndex
CREATE UNIQUE INDEX "devpulse_user_email_key" ON "devpulse_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "devpulse_user_source_pref_userId_sourceId_key" ON "devpulse_user_source_pref"("userId", "sourceId");

-- CreateIndex
CREATE INDEX "devpulse_saved_item_userId_createdAt_idx" ON "devpulse_saved_item"("userId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "devpulse_saved_item_userId_url_key" ON "devpulse_saved_item"("userId", "url");

-- CreateIndex
CREATE UNIQUE INDEX "devpulse_dismissed_item_userId_url_key" ON "devpulse_dismissed_item"("userId", "url");

-- AddForeignKey
ALTER TABLE "devpulse_source" ADD CONSTRAINT "devpulse_source_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "devpulse_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devpulse_user_source_pref" ADD CONSTRAINT "devpulse_user_source_pref_userId_fkey" FOREIGN KEY ("userId") REFERENCES "devpulse_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devpulse_user_source_pref" ADD CONSTRAINT "devpulse_user_source_pref_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "devpulse_source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devpulse_saved_item" ADD CONSTRAINT "devpulse_saved_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "devpulse_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devpulse_dismissed_item" ADD CONSTRAINT "devpulse_dismissed_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "devpulse_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

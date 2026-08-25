-- CreateTable
CREATE TABLE "devopsquest_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devopsquest_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devopsquest_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devopsquest_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devopsquest_user_email_key" ON "devopsquest_user"("email");

-- CreateIndex
CREATE INDEX "devopsquest_progress_userId_idx" ON "devopsquest_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "devopsquest_progress_userId_missionId_key" ON "devopsquest_progress"("userId", "missionId");

-- AddForeignKey
ALTER TABLE "devopsquest_progress" ADD CONSTRAINT "devopsquest_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "devopsquest_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;


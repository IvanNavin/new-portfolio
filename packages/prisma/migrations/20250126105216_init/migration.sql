-- CreateTable
CREATE TABLE "cleaning_history" (
    "id" TEXT NOT NULL,
    "startWeekDate" TIMESTAMP(3) NOT NULL,
    "endWeekDate" TIMESTAMP(3) NOT NULL,
    "apartmentId" TEXT,
    "apartmentListId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cleaning_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cleaning_history" ADD CONSTRAINT "cleaning_history_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "apartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_history" ADD CONSTRAINT "cleaning_history_apartmentListId_fkey" FOREIGN KEY ("apartmentListId") REFERENCES "apartment_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

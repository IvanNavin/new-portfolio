/*
  Warnings:

  - Added the required column `apartmentListId` to the `apartment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "apartment" ADD COLUMN     "apartmentListId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "apartment_list" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apartment_list_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "apartment" ADD CONSTRAINT "apartment_apartmentListId_fkey" FOREIGN KEY ("apartmentListId") REFERENCES "apartment_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

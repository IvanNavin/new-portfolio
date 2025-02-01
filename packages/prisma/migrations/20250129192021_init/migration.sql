/*
  Warnings:

  - You are about to drop the `cleaning_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cleaning_history" DROP CONSTRAINT "cleaning_history_apartmentId_fkey";

-- DropForeignKey
ALTER TABLE "cleaning_history" DROP CONSTRAINT "cleaning_history_apartmentListId_fkey";

-- AlterTable
ALTER TABLE "apartment" ADD COLUMN     "endDate" TIMESTAMP(3);

-- DropTable
DROP TABLE "cleaning_history";

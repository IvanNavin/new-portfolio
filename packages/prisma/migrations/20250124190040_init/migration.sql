/*
  Warnings:

  - You are about to drop the `cleaning-schedule` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `startDate` to the `apartment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cleaning-schedule" DROP CONSTRAINT "cleaning-schedule_apartmentId_fkey";

-- AlterTable
ALTER TABLE "apartment" ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "cleaning-schedule";

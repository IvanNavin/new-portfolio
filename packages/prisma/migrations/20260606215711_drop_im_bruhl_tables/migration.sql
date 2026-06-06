-- Drop unused im-bruhl tables. Project deleted; remaining 5 apartment +
-- 1 apartment_list rows are stale leftovers.

-- DropForeignKey
ALTER TABLE "apartment" DROP CONSTRAINT IF EXISTS "apartment_apartmentListId_fkey";

-- DropTable
DROP TABLE "apartment";

-- DropTable
DROP TABLE "apartment_list";

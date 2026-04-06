/*
  Warnings:

  - The `feedback` column on the `Interview` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "responses" JSONB,
DROP COLUMN "feedback",
ADD COLUMN     "feedback" JSONB;

/*
  Warnings:

  - You are about to drop the column `robes` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "robes",
ADD COLUMN     "items" TEXT[];

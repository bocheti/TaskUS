/*
  Warnings:

  - You are about to drop the column `email` on the `UserRequest` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `UserRequest` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `UserRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `UserRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserRequest_email_key";

-- DropIndex
DROP INDEX "UserRequest_username_key";

-- AlterTable
ALTER TABLE "UserRequest" DROP COLUMN "email",
DROP COLUMN "username",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;

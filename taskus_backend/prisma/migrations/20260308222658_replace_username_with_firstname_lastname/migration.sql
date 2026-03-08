/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `UserRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `UserRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserRequest" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserRequest_email_key" ON "UserRequest"("email");

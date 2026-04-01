/*
  Warnings:

  - Added the required column `providerProfileId` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DietaryPreference" AS ENUM ('REGULAR', 'VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'KETO', 'HALAL');

-- AlterTable
ALTER TABLE "category" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "meal" ADD COLUMN     "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dietaryPreference" "DietaryPreference" NOT NULL DEFAULT 'REGULAR';

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "providerProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "providerProfile" ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "address" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE INDEX "order_providerProfileId_idx" ON "order"("providerProfileId");

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "providerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

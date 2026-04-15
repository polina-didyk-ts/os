/*
  Warnings:

  - Made the column `organizationId` on table `notes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "notes" ALTER COLUMN "organizationId" SET NOT NULL;

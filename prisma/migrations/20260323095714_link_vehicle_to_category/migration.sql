/*
  Warnings:

  - A unique constraint covering the columns `[categoryId]` on the table `vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `categoryId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `vehicle_categoryId_key` ON `vehicle`(`categoryId`);

-- CreateIndex
CREATE INDEX `vehicle_categoryId_idx` ON `vehicle`(`categoryId`);

-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `fuelCategoryId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `vehicle_fuelCategoryId_key` ON `vehicle`(`fuelCategoryId`);

-- CreateIndex
CREATE INDEX `vehicle_fuelCategoryId_idx` ON `vehicle`(`fuelCategoryId`);
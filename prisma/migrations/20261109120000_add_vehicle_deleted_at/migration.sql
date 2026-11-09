-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `vehicle_deletedAt_idx` ON `vehicle`(`deletedAt`);

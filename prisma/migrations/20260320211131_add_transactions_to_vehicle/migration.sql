-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `vehicleId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `transaction_vehicleId_idx` ON `transaction`(`vehicleId`);

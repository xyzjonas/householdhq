-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `dateFirstRegistered` DATETIME(3) NULL,
    ADD COLUMN `dateOfFabrication` DATETIME(3) NULL,
    ADD COLUMN `engineSize` DOUBLE NULL,
    ADD COLUMN `fuelType` VARCHAR(191) NULL,
    ADD COLUMN `mass` DOUBLE NULL,
    ADD COLUMN `maxPower` DOUBLE NULL;

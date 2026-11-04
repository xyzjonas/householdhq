-- CreateTable
CREATE TABLE `vehicle_fuel_entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fueledAt` DATETIME(3) NOT NULL,
    `odometer` DOUBLE NOT NULL,
    `fuelAmount` DOUBLE NOT NULL,
    `unitPrice` DOUBLE NOT NULL,
    `isFullTank` BOOLEAN NOT NULL DEFAULT true,
    `vehicleId` INTEGER NOT NULL,
    `transactionId` INTEGER NOT NULL,
    `previousFullTankFuelEntryId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `vehicle_fuel_entry_vehicleId_idx`(`vehicleId`),
    INDEX `vehicle_fuel_entry_fueledAt_idx`(`fueledAt`),
    INDEX `vehicle_fuel_entry_previousFullTankFuelEntryId_idx`(`previousFullTankFuelEntryId`),
    UNIQUE INDEX `vehicle_fuel_entry_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle_service_entry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('REGULAR_MAINTENANCE', 'DEFECT') NOT NULL,
    `odometer` DOUBLE NULL,
    `title` VARCHAR(191) NOT NULL,
    `servicedAt` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NULL,
    `vehicleId` INTEGER NOT NULL,
    `transactionId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `vehicle_service_entry_vehicleId_idx`(`vehicleId`),
    INDEX `vehicle_service_entry_servicedAt_idx`(`servicedAt`),
    INDEX `vehicle_service_entry_type_idx`(`type`),
    UNIQUE INDEX `vehicle_service_entry_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vin` VARCHAR(191) NOT NULL,
    `registration` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `purchasePrice` DOUBLE NULL,
    `purchasedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vehicle_vin_key`(`vin`),
    UNIQUE INDEX `vehicle_registration_key`(`registration`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

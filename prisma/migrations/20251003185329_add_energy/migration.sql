-- CreateTable
CREATE TABLE `Meter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created` DATETIME(3) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MeterState` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `value` DOUBLE NOT NULL,
    `meteredAt` DATETIME(3) NOT NULL,
    `meterId` INTEGER NOT NULL,

    INDEX `MeterState_meterId_idx`(`meterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `transaction_isImportant_idx` ON `transaction`(`isImportant`);

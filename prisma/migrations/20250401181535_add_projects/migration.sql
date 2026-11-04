-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `projectId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `estimate` DOUBLE NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `transaction_projectId_idx` ON `transaction`(`projectId`);

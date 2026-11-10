-- Multitenancy: every household owns its own accounts, categories, tags,
-- vehicles, meters, ... Existing data becomes the first household ("Home").

-- CreateTable
CREATE TABLE `household` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `membership` (
    `userId` INTEGER NOT NULL,
    `householdId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `membership_householdId_idx`(`householdId`),
    PRIMARY KEY (`userId`, `householdId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `session` ADD COLUMN `householdId` INTEGER NULL;

-- Existing installation: its data becomes household 1, its users become
-- members of it.
INSERT INTO `household` (`id`, `name`)
SELECT 1, 'Home' FROM DUAL
WHERE EXISTS (SELECT 1 FROM `User`)
   OR EXISTS (SELECT 1 FROM `category`)
   OR EXISTS (SELECT 1 FROM `tag`)
   OR EXISTS (SELECT 1 FROM `Source`)
   OR EXISTS (SELECT 1 FROM `transaction`)
   OR EXISTS (SELECT 1 FROM `Project`)
   OR EXISTS (SELECT 1 FROM `Meter`)
   OR EXISTS (SELECT 1 FROM `vehicle`)
   OR EXISTS (SELECT 1 FROM `vehicle_component`)
   OR EXISTS (SELECT 1 FROM `app_settings`);

INSERT INTO `membership` (`userId`, `householdId`)
SELECT `id`, 1 FROM `User` WHERE EXISTS (SELECT 1 FROM `household` WHERE `id` = 1);

-- AlterTable
ALTER TABLE `category` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `category` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `category_householdId_idx` ON `category`(`householdId`);

-- AlterTable
ALTER TABLE `tag` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `tag` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `tag_householdId_idx` ON `tag`(`householdId`);

-- AlterTable
ALTER TABLE `SourceState` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `SourceState` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `SourceState_householdId_idx` ON `SourceState`(`householdId`);

-- AlterTable
ALTER TABLE `Source` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `Source` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `Source_householdId_idx` ON `Source`(`householdId`);

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `transaction` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `transaction_householdId_idx` ON `transaction`(`householdId`);

-- AlterTable
ALTER TABLE `Project` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `Project` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `Project_householdId_idx` ON `Project`(`householdId`);

-- AlterTable
ALTER TABLE `Meter` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `Meter` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `Meter_householdId_idx` ON `Meter`(`householdId`);

-- AlterTable
ALTER TABLE `MeterState` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `MeterState` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `MeterState_householdId_idx` ON `MeterState`(`householdId`);

-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `vehicle` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `vehicle_householdId_idx` ON `vehicle`(`householdId`);

-- AlterTable
ALTER TABLE `vehicle_fuel_entry` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `vehicle_fuel_entry` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `vehicle_fuel_entry_householdId_idx` ON `vehicle_fuel_entry`(`householdId`);

-- AlterTable
ALTER TABLE `vehicle_service_entry` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `vehicle_service_entry` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `vehicle_service_entry_householdId_idx` ON `vehicle_service_entry`(`householdId`);

-- AlterTable
ALTER TABLE `vehicle_component` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `vehicle_component` ALTER COLUMN `householdId` SET DEFAULT 0;

-- CreateIndex
CREATE INDEX `vehicle_component_householdId_idx` ON `vehicle_component`(`householdId`);

-- AlterTable: one settings row per household instead of a singleton with id 1
ALTER TABLE `app_settings` ADD COLUMN `householdId` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `app_settings` ALTER COLUMN `householdId` SET DEFAULT 0;
ALTER TABLE `app_settings` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- CreateIndex
CREATE UNIQUE INDEX `app_settings_householdId_key` ON `app_settings`(`householdId`);

-- Names (and VINs, plates) are unique within a household, not globally
DROP INDEX `category_name_key` ON `category`;
CREATE UNIQUE INDEX `category_householdId_name_key` ON `category`(`householdId`, `name`);

DROP INDEX `tag_name_key` ON `tag`;
CREATE UNIQUE INDEX `tag_householdId_name_key` ON `tag`(`householdId`, `name`);

DROP INDEX `vehicle_vin_key` ON `vehicle`;
CREATE UNIQUE INDEX `vehicle_householdId_vin_key` ON `vehicle`(`householdId`, `vin`);

DROP INDEX `vehicle_registration_key` ON `vehicle`;
CREATE UNIQUE INDEX `vehicle_householdId_registration_key` ON `vehicle`(`householdId`, `registration`);

DROP INDEX `vehicle_component_name_key` ON `vehicle_component`;
CREATE UNIQUE INDEX `vehicle_component_householdId_name_key` ON `vehicle_component`(`householdId`, `name`);

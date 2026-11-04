-- AlterTable
ALTER TABLE `vehicle` ADD COLUMN `defaultFuelTransactionTitle` VARCHAR(191) NOT NULL DEFAULT 'Fuel';

-- DataMigration
UPDATE `vehicle` v
JOIN `app_settings` s ON s.`id` = 1
SET v.`defaultFuelTransactionTitle` = s.`defaultFuelTransactionTitle`;

-- AlterTable
ALTER TABLE `app_settings` DROP COLUMN `defaultFuelTransactionTitle`;

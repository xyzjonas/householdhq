-- AlterTable
ALTER TABLE `app_settings` ADD COLUMN `mankoCategoryId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `app_settings_mankoCategoryId_idx` ON `app_settings`(`mankoCategoryId`);

-- The fallback category for checkpoint adjustments must always exist
INSERT INTO `category` (`name`, `description`)
SELECT 'N/A', 'Uncategorised, e.g. balance checkpoint adjustments' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `category` WHERE `name` = 'N/A');

UPDATE `app_settings`
SET `mankoCategoryId` = (SELECT `id` FROM `category` WHERE `name` = 'N/A')
WHERE `mankoCategoryId` IS NULL;

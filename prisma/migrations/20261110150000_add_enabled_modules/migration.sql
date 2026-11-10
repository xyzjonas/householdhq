-- AlterTable: modules a household shows in its navigation (NULL = all of them)
ALTER TABLE `app_settings` ADD COLUMN `enabledModules` VARCHAR(191) NULL;

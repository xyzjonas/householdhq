-- AlterTable: households get an icon (a name from the icon catalog) and a colour
ALTER TABLE `household` ADD COLUMN `icon` VARCHAR(191) NOT NULL DEFAULT 'house',
    ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT '#4f46e5';

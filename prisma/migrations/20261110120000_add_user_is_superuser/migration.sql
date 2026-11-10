-- AlterTable
ALTER TABLE `User` ADD COLUMN `isSuperuser` BOOLEAN NOT NULL DEFAULT false;

-- The account that was created first (during setup) is the superuser.
UPDATE `User` SET `isSuperuser` = true ORDER BY `id` ASC LIMIT 1;

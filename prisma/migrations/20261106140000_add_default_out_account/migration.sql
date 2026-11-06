-- AlterTable
ALTER TABLE `app_settings` ADD COLUMN `defaultOutAccountId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `app_settings_defaultOutAccountId_idx` ON `app_settings`(`defaultOutAccountId`);

-- Keep the long-standing convention (the outgoing account with id 2), falling
-- back to the first external account.
UPDATE `app_settings`
SET `defaultOutAccountId` = COALESCE(
  (SELECT `id` FROM `Source` WHERE `id` = 2 AND `isOut` = 1),
  (SELECT `id` FROM `Source` WHERE `isOut` = 1 ORDER BY `position`, `id` LIMIT 1)
)
WHERE `defaultOutAccountId` IS NULL;

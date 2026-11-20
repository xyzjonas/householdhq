-- AlterTable: share of a monthly budget (percent) at which the dashboard flags it
ALTER TABLE `app_settings` ADD COLUMN `budgetAlertPct` INTEGER NOT NULL DEFAULT 90;

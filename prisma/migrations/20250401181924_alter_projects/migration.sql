/*
  Warnings:

  - Added the required column `name` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Project` ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL;

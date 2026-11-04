/*
  Warnings:

  - You are about to drop the column `trasactedAt` on the `transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `transaction` 
RENAME COLUMN `trasactedAt` TO `transactedAt`;

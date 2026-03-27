-- AlterTable
ALTER TABLE `vehicle_service_entry` MODIFY `type` ENUM('REGULAR_MAINTENANCE', 'DEFECT', 'FEES', 'UPGRADE') NOT NULL;

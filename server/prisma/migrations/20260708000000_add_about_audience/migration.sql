-- AlterTable
ALTER TABLE `SiteSetting` ADD COLUMN `aboutAudience` JSON NOT NULL DEFAULT ('{"title":"Khách hàng mục tiêu","intro":"","bullets":[]}');

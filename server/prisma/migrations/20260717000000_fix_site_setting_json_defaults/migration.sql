-- Fix SiteSetting JSON defaults: ensure ASCII-only defaults and add missing
-- heroMetrics / trustBadges columns if a prior migration only added
-- aboutAudience. This keeps the schema safe to apply on hosts whose MySQL
-- connection charset is not utf8mb4 and avoids JSON_VALID constraint failures
-- on insert with non-ASCII default literals.

ALTER TABLE `SiteSetting`
  MODIFY COLUMN `aboutAudience` JSON NOT NULL DEFAULT (JSON_OBJECT('title','','intro','','bullets',JSON_ARRAY())),
  MODIFY COLUMN `heroMetrics`   JSON NOT NULL DEFAULT (JSON_ARRAY()),
  MODIFY COLUMN `trustBadges`   JSON NOT NULL DEFAULT (JSON_ARRAY());

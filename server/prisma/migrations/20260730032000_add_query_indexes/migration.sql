-- CreateIndex
CREATE INDEX `Lead_status_idx` ON `Lead`(`status`);

-- CreateIndex
CREATE INDEX `AuditLog_createdAt_idx` ON `AuditLog`(`createdAt`);
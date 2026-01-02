-- CreateIndex
CREATE INDEX `Event_status_idx` ON `Event`(`status`);

-- CreateIndex
CREATE INDEX `Event_eventDate_idx` ON `Event`(`eventDate`);

-- CreateIndex
CREATE INDEX `Event_createdAt_idx` ON `Event`(`createdAt`);

-- CreateIndex
CREATE INDEX `Ticket_status_idx` ON `Ticket`(`status`);

-- CreateIndex
CREATE INDEX `Ticket_createdAt_idx` ON `Ticket`(`createdAt`);

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- CreateIndex
CREATE INDEX `User_isBanned_idx` ON `User`(`isBanned`);

-- CreateIndex
CREATE INDEX `User_createdAt_idx` ON `User`(`createdAt`);

-- RedefineIndex
CREATE INDEX `Event_creatorId_idx` ON `Event`(`creatorId`);
DROP INDEX `Event_creatorId_fkey` ON `event`;

-- RedefineIndex
CREATE INDEX `Ticket_assignedToId_idx` ON `Ticket`(`assignedToId`);
DROP INDEX `Ticket_assignedToId_fkey` ON `ticket`;

-- RedefineIndex
CREATE INDEX `Ticket_creatorId_idx` ON `Ticket`(`creatorId`);
DROP INDEX `Ticket_creatorId_fkey` ON `ticket`;

ALTER TABLE `sessions` ADD `cancelledBy` int;--> statement-breakpoint
ALTER TABLE `sessions` ADD `cancellationRated` boolean DEFAULT false NOT NULL;
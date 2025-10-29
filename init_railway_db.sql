-- UniTutor Database Initialization for Railway MySQL
-- Generated: 2025-10-28

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS `chatMessages`;
DROP TABLE IF EXISTS `ratings`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `profiles`;
DROP TABLE IF EXISTS `users`;

-- Create users table
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

-- Create profiles table
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userRole` enum('student','tutor') NOT NULL,
	`age` int,
	`year` varchar(50),
	`major` varchar(255),
	`bio` text,
	`priceMin` int,
	`priceMax` int,
	`courses` json,
	`availability` json,
	`creditPoints` int NOT NULL DEFAULT 0,
	`contactInfo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);

-- Create sessions table
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`tutorId` int NOT NULL,
	`course` varchar(255) NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp NOT NULL,
	`status` enum('PENDING','CONFIRMED','PENDING_RATING','DISPUTED','CLOSED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`studentCompleted` boolean NOT NULL DEFAULT false,
	`tutorCompleted` boolean NOT NULL DEFAULT false,
	`studentRated` boolean NOT NULL DEFAULT false,
	`tutorRated` boolean NOT NULL DEFAULT false,
	`cancelled` boolean NOT NULL DEFAULT false,
	`cancelReason` text,
	`cancelledBy` int,
	`cancellationRated` boolean DEFAULT false NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);

-- Create chatMessages table
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`senderId` int NOT NULL,
	`message` text NOT NULL,
	`sanitized` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);

-- Create ratings table
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`raterId` int NOT NULL,
	`targetId` int NOT NULL,
	`score` int NOT NULL,
	`comment` text,
	`visibility` enum('public','private') NOT NULL DEFAULT 'public',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`)
);

-- Create tickets table
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('account','matching','cancellation','ratings','rules','technical') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` enum('pending','in_progress','resolved') NOT NULL DEFAULT 'pending',
	`adminResponse` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);

-- Add foreign key constraints
ALTER TABLE `chatMessages` ADD CONSTRAINT `chatMessages_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `chatMessages` ADD CONSTRAINT `chatMessages_senderId_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_raterId_users_id_fk` FOREIGN KEY (`raterId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_targetId_users_id_fk` FOREIGN KEY (`targetId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_studentId_users_id_fk` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_tutorId_users_id_fk` FOREIGN KEY (`tutorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;


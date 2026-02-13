CREATE TABLE `analyticsEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('signup','onboarding_complete','first_task_complete','task_complete','streak_milestone','premium_upgrade','notification_sent','notification_clicked','session_start','session_end') NOT NULL,
	`metadata` json,
	`date` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationABTests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`testId` varchar(100) NOT NULL,
	`variant` enum('control','variant_a','variant_b') NOT NULL,
	`message` text NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`delivered` int NOT NULL DEFAULT 0,
	`clicked` int NOT NULL DEFAULT 0,
	`dismissed` int NOT NULL DEFAULT 0,
	`clickedAt` timestamp,
	`taskCompletedAfter` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificationABTests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streakMilestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`streakDays` int NOT NULL,
	`milestoneType` enum('seven_day','thirty_day','hundred_day','custom') NOT NULL,
	`achievedAt` timestamp NOT NULL,
	`celebrationShown` int NOT NULL DEFAULT 0,
	`shared` int NOT NULL DEFAULT 0,
	`badgeEarned` varchar(100),
	`coinReward` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `streakMilestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analyticsEvents` ADD CONSTRAINT `analyticsEvents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificationABTests` ADD CONSTRAINT `notificationABTests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `streakMilestones` ADD CONSTRAINT `streakMilestones_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
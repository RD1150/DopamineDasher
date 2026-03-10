CREATE TABLE `socialShares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskTitle` text NOT NULL,
	`platform` enum('twitter','linkedin','facebook','clipboard') NOT NULL,
	`message` text,
	`timeSpent` int,
	`streakCount` int,
	`sharedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `socialShares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `socialShares` ADD CONSTRAINT `socialShares_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
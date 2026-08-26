CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pr_id` integer NOT NULL,
	`github_id` integer NOT NULL,
	`author` text NOT NULL,
	`body` text NOT NULL,
	FOREIGN KEY (`pr_id`) REFERENCES `prs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comments_pr_id_idx` ON `comments` (`pr_id`);--> statement-breakpoint
CREATE TABLE `prs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`repo_id` integer NOT NULL,
	`number` integer NOT NULL,
	`title` text NOT NULL,
	`author_name` text,
	`author_email` text,
	`url` text NOT NULL,
	`created_at` text NOT NULL,
	`last_updated` text NOT NULL,
	`reviews_synced_for_last_updated` text,
	`reviews_synced_at` text,
	FOREIGN KEY (`repo_id`) REFERENCES `repos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prs_repo_id_number_unique` ON `prs` (`repo_id`,`number`);--> statement-breakpoint
CREATE TABLE `repos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner` text NOT NULL,
	`repo` text NOT NULL,
	`last_synced_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `repos_owner_repo_unique` ON `repos` (`owner`,`repo`);
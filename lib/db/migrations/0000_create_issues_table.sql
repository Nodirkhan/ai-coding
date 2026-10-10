CREATE TABLE `issues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'TODO' NOT NULL,
	`priority` text DEFAULT 'MEDIUM' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	CONSTRAINT "issues_status_check" CHECK("issues"."status" in ('TODO', 'IN_PROGRESS', 'DONE')),
	CONSTRAINT "issues_priority_check" CHECK("issues"."priority" in ('LOW', 'MEDIUM', 'HIGH')),
	CONSTRAINT "issues_title_not_blank_check" CHECK(trim("issues"."title") != '')
);

ALTER TABLE "file_uploads" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "file_uploads" ADD COLUMN "upload_id" varchar(255) PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "file_uploads" ADD COLUMN "uploaded" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "file_uploads" ADD COLUMN "date_created" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "file_uploads" DROP COLUMN "file_name";--> statement-breakpoint
ALTER TABLE "file_uploads" DROP COLUMN "loaded";
ALTER TABLE "notes" ALTER COLUMN "parentId" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "parentId" DROP NOT NULL;
ALTER TABLE "notes" RENAME COLUMN "parentId" TO "parent_id";--> statement-breakpoint
ALTER TABLE "notes" DROP CONSTRAINT "notes_parentId_notes_id_fk";
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_parent_id_notes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
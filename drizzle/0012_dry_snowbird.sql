ALTER TABLE "notes" DROP CONSTRAINT "notes_parentId_notes_id_fk";
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_parentId_notes_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;
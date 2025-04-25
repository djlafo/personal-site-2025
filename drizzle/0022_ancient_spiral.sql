ALTER TABLE "planner_row" DROP CONSTRAINT "planner_row_planner_id_planner_row_id_fk";
--> statement-breakpoint
ALTER TABLE "planner_row" ADD CONSTRAINT "planner_row_planner_id_planner_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner"("id") ON DELETE no action ON UPDATE no action;
CREATE TABLE "planner_row" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "planner_row_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"planner_id" integer NOT NULL,
	"label" varchar(255) NOT NULL,
	"motivation" integer NOT NULL,
	"deadline" integer DEFAULT 0 NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"text" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "planner_row" ADD CONSTRAINT "planner_row_planner_id_planner_row_id_fk" FOREIGN KEY ("planner_id") REFERENCES "public"."planner_row"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planner" DROP COLUMN "data";
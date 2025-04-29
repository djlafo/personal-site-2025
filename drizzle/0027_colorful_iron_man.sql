ALTER TABLE "planner_row" RENAME COLUMN "textAt" TO "text_at";--> statement-breakpoint
ALTER TABLE "planner_row" ADD COLUMN "recur_months" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "planner_row" ADD COLUMN "recur_days" integer DEFAULT 0 NOT NULL;
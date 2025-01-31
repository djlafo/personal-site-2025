ALTER TABLE "polls" ALTER COLUMN "active" SET NOT NULL;
ALTER TABLE "polls" ADD COLUMN "ranked_choice" boolean DEFAULT false NOT NULL;
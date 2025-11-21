ALTER TABLE "opening" ADD COLUMN "popularity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "opening" ADD COLUMN "difficulty_level" text DEFAULT 'intermediate' NOT NULL;--> statement-breakpoint
ALTER TABLE "opening" ADD COLUMN "themes" json DEFAULT '[]'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "opening" ADD COLUMN "win_rate" real;--> statement-breakpoint
ALTER TABLE "opening" ADD COLUMN "draw_rate" real;--> statement-breakpoint
ALTER TABLE "opening" ADD COLUMN "loss_rate" real;--> statement-breakpoint
CREATE INDEX "opening_difficulty_idx" ON "opening" USING btree ("difficulty_level");--> statement-breakpoint
CREATE INDEX "opening_popularity_idx" ON "opening" USING btree ("popularity");
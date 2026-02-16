CREATE UNIQUE INDEX "queue_user_unique_idx" ON "matchmaking_queue" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_opening_unique_idx" ON "user_opening" USING btree ("user_id","opening_id","color");--> statement-breakpoint
CREATE UNIQUE INDEX "user_puzzle_unique_idx" ON "user_puzzle" USING btree ("user_id","puzzle_id");
CREATE TABLE "account" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "game_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"move_analysis" json NOT NULL,
	"average_accuracy" integer NOT NULL,
	"blunders" integer DEFAULT 0 NOT NULL,
	"mistakes" integer DEFAULT 0 NOT NULL,
	"inaccuracies" integer DEFAULT 0 NOT NULL,
	"brilliant_moves" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"player_color" text NOT NULL,
	"opponent_type" text NOT NULL,
	"difficulty" text,
	"time_control" text NOT NULL,
	"result" text NOT NULL,
	"end_reason" text NOT NULL,
	"final_fen" text NOT NULL,
	"player_time" integer,
	"opponent_time" integer,
	"pgn" text NOT NULL,
	"moves" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"accuracy" integer
);
--> statement-breakpoint
CREATE TABLE "matchmaking_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"time_control" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opening" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"eco" text,
	"moves" json NOT NULL,
	"fen" text NOT NULL,
	"description" text,
	"variations" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "puzzle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fen" text NOT NULL,
	"moves" json NOT NULL,
	"rating" integer NOT NULL,
	"themes" json,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pvp_game" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"white_player_id" uuid NOT NULL,
	"black_player_id" uuid NOT NULL,
	"ably_channel_id" text NOT NULL,
	"current_fen" text NOT NULL,
	"moves" json DEFAULT '[]'::json NOT NULL,
	"time_control" text NOT NULL,
	"white_time" integer NOT NULL,
	"black_time" integer NOT NULL,
	"status" text NOT NULL,
	"result" text,
	"end_reason" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_move_at" timestamp,
	"completed_at" timestamp,
	CONSTRAINT "pvp_game_ably_channel_id_unique" UNIQUE("ably_channel_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_opening" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"opening_id" uuid NOT NULL,
	"color" text NOT NULL,
	"notes" text,
	"times_played" integer DEFAULT 0 NOT NULL,
	"last_practiced" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_puzzle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"puzzle_id" uuid NOT NULL,
	"solved" boolean DEFAULT false NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"solved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"rating" integer DEFAULT 1200 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_analysis" ADD CONSTRAINT "game_analysis_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matchmaking_queue" ADD CONSTRAINT "matchmaking_queue_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pvp_game" ADD CONSTRAINT "pvp_game_white_player_id_user_id_fk" FOREIGN KEY ("white_player_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pvp_game" ADD CONSTRAINT "pvp_game_black_player_id_user_id_fk" FOREIGN KEY ("black_player_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_opening" ADD CONSTRAINT "user_opening_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_opening" ADD CONSTRAINT "user_opening_opening_id_opening_id_fk" FOREIGN KEY ("opening_id") REFERENCES "public"."opening"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_puzzle" ADD CONSTRAINT "user_puzzle_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_puzzle" ADD CONSTRAINT "user_puzzle_puzzle_id_puzzle_id_fk" FOREIGN KEY ("puzzle_id") REFERENCES "public"."puzzle"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_analysis_game_idx" ON "game_analysis" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_user_idx" ON "game" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_created_at_idx" ON "game" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "queue_time_control_idx" ON "matchmaking_queue" USING btree ("time_control");--> statement-breakpoint
CREATE INDEX "queue_rating_idx" ON "matchmaking_queue" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "queue_user_idx" ON "matchmaking_queue" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "opening_name_idx" ON "opening" USING btree ("name");--> statement-breakpoint
CREATE INDEX "opening_eco_idx" ON "opening" USING btree ("eco");--> statement-breakpoint
CREATE INDEX "puzzle_rating_idx" ON "puzzle" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "pvp_game_status_idx" ON "pvp_game" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pvp_game_white_idx" ON "pvp_game" USING btree ("white_player_id");--> statement-breakpoint
CREATE INDEX "pvp_game_black_idx" ON "pvp_game" USING btree ("black_player_id");--> statement-breakpoint
CREATE INDEX "pvp_game_ably_channel_idx" ON "pvp_game" USING btree ("ably_channel_id");--> statement-breakpoint
CREATE INDEX "user_opening_user_idx" ON "user_opening" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_opening_opening_idx" ON "user_opening" USING btree ("opening_id");--> statement-breakpoint
CREATE INDEX "user_puzzle_user_idx" ON "user_puzzle" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_puzzle_puzzle_idx" ON "user_puzzle" USING btree ("puzzle_id");
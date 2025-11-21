import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  primaryKey,
  json,
  index,
  real,
} from "drizzle-orm/pg-core"
import type { AdapterAccount } from "next-auth/adapters"

// Auth.js required tables
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  rating: integer("rating").default(1200).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [
    primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  ]
)

// Chess game tables
export const games = pgTable("game", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  playerColor: text("player_color").notNull(), // 'w' or 'b'
  opponentType: text("opponent_type").notNull(), // 'bot' or 'human'
  difficulty: text("difficulty"), // Bot difficulty if opponent is bot
  timeControl: text("time_control").notNull(), // 'bullet', 'blitz', 'rapid', 'classical'
  result: text("result").notNull(), // 'win', 'loss', 'draw'
  endReason: text("end_reason").notNull(), // 'checkmate', 'timeout', 'resignation', 'stalemate', etc.
  finalFen: text("final_fen").notNull(),
  playerTime: integer("player_time"), // Time remaining in seconds
  opponentTime: integer("opponent_time"),
  pgn: text("pgn").notNull(), // Full game in PGN format
  moves: json("moves").$type<string[]>().notNull(), // Array of moves in SAN notation
  createdAt: timestamp("created_at").defaultNow().notNull(),
  accuracy: integer("accuracy"), // Player accuracy percentage (calculated post-game)
}, (table) => [
  index("game_user_idx").on(table.userId),
  index("game_created_at_idx").on(table.createdAt),
])

// Puzzle tables
export const puzzles = pgTable("puzzle", {
  id: uuid("id").primaryKey().defaultRandom(),
  fen: text("fen").notNull(), // Starting position
  moves: json("moves").$type<string[]>().notNull(), // Solution moves
  rating: integer("rating").notNull(), // Puzzle difficulty rating
  themes: json("themes").$type<string[]>(), // e.g., ['fork', 'pin', 'mate-in-2']
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("puzzle_rating_idx").on(table.rating),
])

export const userPuzzles = pgTable("user_puzzle", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  puzzleId: uuid("puzzle_id")
    .notNull()
    .references(() => puzzles.id, { onDelete: "cascade" }),
  solved: boolean("solved").default(false).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  solvedAt: timestamp("solved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("user_puzzle_user_idx").on(table.userId),
  index("user_puzzle_puzzle_idx").on(table.puzzleId),
])

// Opening repertoire tables
export const openings = pgTable("opening", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "Sicilian Defense", "Ruy Lopez"
  eco: text("eco"), // ECO code (e.g., "B20", "C60")
  moves: json("moves").$type<string[]>().notNull(), // Main line moves
  fen: text("fen").notNull(), // Resulting position
  description: text("description"),
  variations: json("variations").$type<Array<{ name: string; moves: string[] }>>(),
  // Stats and metadata
  popularity: integer("popularity").default(0).notNull(), // Higher = more popular
  difficultyLevel: text("difficulty_level").default("intermediate").notNull(), // beginner, intermediate, advanced, master
  themes: json("themes").$type<string[]>().default([]).notNull(), // ["tactical", "positional", "sharp", "solid", "popular"]
  winRate: real("win_rate"), // Percentage as decimal (e.g., 0.45 = 45%)
  drawRate: real("draw_rate"), // Percentage as decimal
  lossRate: real("loss_rate"), // Percentage as decimal
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("opening_name_idx").on(table.name),
  index("opening_eco_idx").on(table.eco),
  index("opening_difficulty_idx").on(table.difficultyLevel),
  index("opening_popularity_idx").on(table.popularity),
])

export const userOpenings = pgTable("user_opening", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  openingId: uuid("opening_id")
    .notNull()
    .references(() => openings.id, { onDelete: "cascade" }),
  color: text("color").notNull(), // 'w' or 'b' - which side user plays
  notes: text("notes"),
  timesPlayed: integer("times_played").default(0).notNull(),
  lastPracticed: timestamp("last_practiced"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("user_opening_user_idx").on(table.userId),
  index("user_opening_opening_idx").on(table.openingId),
])

// Game analysis tables
export const gameAnalysis = pgTable("game_analysis", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  moveAnalysis: json("move_analysis").$type<Array<{
    move: string
    evaluation: number
    bestMove?: string
    classification: 'brilliant' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'
  }>>().notNull(),
  averageAccuracy: integer("average_accuracy").notNull(),
  blunders: integer("blunders").default(0).notNull(),
  mistakes: integer("mistakes").default(0).notNull(),
  inaccuracies: integer("inaccuracies").default(0).notNull(),
  brilliantMoves: integer("brilliant_moves").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("game_analysis_game_idx").on(table.gameId),
])

// PvP (Player vs Player) tables
export const pvpGames = pgTable("pvp_game", {
  id: uuid("id").primaryKey().defaultRandom(),
  whitePlayerId: uuid("white_player_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  blackPlayerId: uuid("black_player_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  ablyChannelId: text("ably_channel_id").notNull().unique(), // Ably channel for real-time communication

  currentFen: text("current_fen").notNull(),
  moves: json("moves").$type<string[]>().default([]).notNull(),

  timeControl: text("time_control").notNull(), // 'bullet', 'blitz', 'rapid'
  whiteTime: integer("white_time").notNull(), // Seconds remaining
  blackTime: integer("black_time").notNull(),

  status: text("status").notNull(), // 'waiting', 'active', 'completed'
  result: text("result"), // 'white', 'black', 'draw'
  endReason: text("end_reason"), // 'checkmate', 'timeout', 'resignation', 'draw'

  drawOfferedBy: uuid("draw_offered_by"), // ID of player who offered draw (null if no pending offer)

  startedAt: timestamp("started_at").defaultNow().notNull(),
  lastMoveAt: timestamp("last_move_at"),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("pvp_game_status_idx").on(table.status),
  index("pvp_game_white_idx").on(table.whitePlayerId),
  index("pvp_game_black_idx").on(table.blackPlayerId),
  index("pvp_game_ably_channel_idx").on(table.ablyChannelId),
])

export const matchmakingQueue = pgTable("matchmaking_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  timeControl: text("time_control").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("queue_time_control_idx").on(table.timeControl),
  index("queue_rating_idx").on(table.rating),
  index("queue_user_idx").on(table.userId),
])

// Type exports for use in application
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Game = typeof games.$inferSelect
export type NewGame = typeof games.$inferInsert

export type Puzzle = typeof puzzles.$inferSelect
export type NewPuzzle = typeof puzzles.$inferInsert

export type UserPuzzle = typeof userPuzzles.$inferSelect
export type NewUserPuzzle = typeof userPuzzles.$inferInsert

export type Opening = typeof openings.$inferSelect
export type NewOpening = typeof openings.$inferInsert

export type UserOpening = typeof userOpenings.$inferSelect
export type NewUserOpening = typeof userOpenings.$inferInsert

export type GameAnalysis = typeof gameAnalysis.$inferSelect
export type NewGameAnalysis = typeof gameAnalysis.$inferInsert

export type PvpGame = typeof pvpGames.$inferSelect
export type NewPvpGame = typeof pvpGames.$inferInsert

export type MatchmakingQueueEntry = typeof matchmakingQueue.$inferSelect
export type NewMatchmakingQueueEntry = typeof matchmakingQueue.$inferInsert

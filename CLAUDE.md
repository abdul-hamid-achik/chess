# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Daily Development
```bash
pnpm dev          # Start development server on localhost:3000
pnpm build        # Build for production
pnpm lint         # Run ESLint with TypeScript support
```

### Database Operations
```bash
pnpm db:generate  # Generate Drizzle migration files from schema changes
pnpm db:push      # Push schema directly to database (development)
pnpm db:migrate   # Run migrations (production)
pnpm db:studio    # Open Drizzle Studio at https://local.drizzle.studio
pnpm db:seed      # Seed database with puzzles and openings
```

**Seeding specific datasets:**
```bash
pnpm db:seed puzzles           # Seed only puzzles (30 tactical puzzles)
pnpm db:seed openings          # Seed only openings (70+ openings)
pnpm db:seed puzzles openings  # Seed multiple datasets
```

## Architecture Overview

### Stack
- **Next.js 16** with App Router, Server Components, and Server Actions
- **PostgreSQL** database with **Drizzle ORM** for type-safe queries
- **Auth.js v5** (NextAuth) for authentication with Drizzle adapter
- **chess.js** for game logic, **react-chessboard** for UI
- **shadcn/ui** components (57 Radix UI-based components)
- **Tailwind CSS 4.x** for styling with dark/light mode

### Project Organization

**Feature-based component structure:**
```
components/features/
├── auth/          # Sign-in/up forms
├── game/          # Chess game UI (board, game state, replay)
├── puzzles/       # Puzzle solver and trainer
├── analysis/      # Game analysis display components
├── profile/       # Profile, stats, charts
└── learn/         # Opening browser and repertoire
```

**Server-side logic:**
```
lib/
├── actions/       # Server actions (games, puzzles, openings, analysis, statistics)
├── auth/          # Auth.js configuration and auth actions
├── chess/         # AI engine with minimax algorithm
├── api/           # External API clients (Chess-API.com)
└── db/            # Database schema, connection, migrations, seeds
```

### Route Groups
- `app/(auth)/` - Public authentication routes (sign-in, sign-up)
- `app/(dashboard)/` - Protected routes requiring session (play, puzzles, learn, profile, analysis)

### Route Protection Pattern
```tsx
// In server components (layout.tsx or page.tsx)
import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"

const session = await auth()
if (!session?.user) {
  redirect("/sign-in")
}
```

## Database Schema (Drizzle ORM)

### Core Tables
- **users** - User accounts with `rating` field (default: 1200)
- **games** - Completed games with PGN, moves array, result, accuracy
- **gameAnalysis** - Move-by-move analysis with classification
- **puzzles** - 30+ tactical puzzles (rating 800-2150)
- **userPuzzles** - User puzzle attempts and solve tracking
- **openings** - 70+ chess openings with ECO codes and variations
- **userOpenings** - User's personal opening repertoire (separate for White/Black)

### Important Schema Details
- JSON columns: `moves` (string[]), `moveAnalysis` (MoveAnalysisData[]), `variations` (object[])
- Indexes on: `user_id`, `created_at`, `rating`, `game_id`, `puzzle_id`, `opening_id`
- Cascade deletes for referential integrity
- Type inference: `$inferSelect` and `$inferInsert` from schema

## Server Actions Pattern

All data mutations use server actions in `lib/actions/`:

**Consistent response format:**
```typescript
{ success?: boolean, error?: string, data?: T }
```

**Standard pattern:**
```typescript
"use server"

import { auth } from "@/lib/auth/config"

export async function actionName(params) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    // Database operations
    return { success: true, data: result }
  } catch (error) {
    console.error("Error:", error)
    return { error: "Failed to perform action" }
  }
}
```

## Chess-Specific Architecture

### AI Engine (`lib/chess/engine.ts`)
- Minimax algorithm with alpha-beta pruning
- 4 difficulty levels: Basic (depth 2), Intermediate (depth 3), Advanced (depth 4), Pro (depth 5)
- Piece-square tables for positional evaluation
- Exports: `getBestMove(game: Chess, difficulty: Difficulty)`

### Game Analysis System
**Flow:** Game → PGN → Positions → Chess-API.com → Classification → Storage

**Move classification thresholds (centipawns):**
- **Brilliant**: Better than engine's best move (< -10 cp)
- **Great**: Within 0.1 pawns (< 10 cp)
- **Good**: Within 0.5 pawns (< 50 cp)
- **Inaccuracy**: 0.5-1.0 pawns worse (50-100 cp)
- **Mistake**: 1.0-2.0 pawns worse (100-200 cp)
- **Blunder**: 2+ pawns worse (200+ cp)

**Accuracy calculation:** Lichess formula `100 * (1 - delta / (delta + 200))`

**Rate limiting:** 150ms delay between Chess-API.com requests

### react-chessboard v5.8.4 API
**IMPORTANT:** All props must be wrapped in `options` object:

```tsx
<Chessboard
  options={{
    position: fen,
    onPieceDrop: ({ piece, sourceSquare, targetSquare }) => boolean,
    onSquareClick: ({ piece, square }) => void,
    boardOrientation: "white" | "black",
    allowDragging: boolean,  // NOT arePiecesDraggable
    boardStyle: {},          // NOT customBoardStyle
    squareStyles: {},
  }}
/>
```

**Event handler signatures:**
- `onPieceDrop`: `({ piece?: unknown, sourceSquare: string, targetSquare: string | null }) => boolean`
- `onSquareClick`: `({ piece?: unknown, square: string }) => void`
- Always check `if (!targetSquare) return false` in onPieceDrop

## Common Patterns

### Server Component with Data Fetching
```tsx
import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { getUserGames } from "@/lib/actions/games"

export default async function Page() {
  const session = await auth()
  if (!session?.user) redirect("/sign-in")

  const games = await getUserGames(10)

  return <ClientComponent games={games} />
}
```

### Client Component with Server Actions
```tsx
"use client"

import { saveGame } from "@/lib/actions/games"
import { toast } from "sonner"

export function Component() {
  const handleSave = async () => {
    const response = await saveGame(data)
    if (response.error) {
      toast.error(response.error)
    } else if (response.success) {
      toast.success("Game saved!")
    }
  }

  return <button onClick={handleSave}>Save</button>
}
```

### Form with react-hook-form + Zod
```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  field: z.string().min(1, "Required"),
})

export function Form() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { field: "" },
  })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // Handle submission
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

## ESLint Configuration

Unused parameters/variables/errors prefixed with `_` are ignored:

```typescript
// These won't trigger ESLint warnings:
function example(_unused: string, used: string) {}
const { data, _metadata } = response
try {} catch (_error) {}
```

## Game State Management

**IMPORTANT:** Use `useRef` for Chess.js instances to prevent stale closures:

```tsx
const gameRef = useRef(new Chess())

// Access with gameRef.current, not game state
const makeMove = () => {
  const result = gameRef.current.move(...)
  setFen(gameRef.current.fen())
}
```

## Environment Variables

Required in `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host:5432/chess"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
```

## Key Files

- `lib/db/schema.ts` - Single source of truth for database structure
- `lib/auth/config.ts` - Auth.js configuration with JWT callbacks
- `lib/chess/engine.ts` - AI minimax algorithm implementation
- `lib/analysis-helpers.ts` - Move classification and accuracy calculations
- `types/analysis.ts` - TypeScript types for move analysis
- `eslint.config.mjs` - ESLint rules with TypeScript support

## Important Notes

- **Database changes:** Always run `pnpm db:generate` then `pnpm db:push` after schema changes
- **TypeScript errors in build:** Currently ignored in `next.config.mjs` due to react-chessboard types
- **Session data:** Includes `user.id` and `user.rating` via custom JWT callback
- **Rating system:** +10 for win, -10 for loss, 0 for draw (updated on game save)
- **PGN generation:** Use `game.pgn()` from chess.js for complete game notation
- **Move validation:** Always use chess.js `move()` method for validation, never trust client input
- **Puzzle solutions:** Stored as move notation strings (SAN format: "Nxe5", "Qh5+")
- **Opening variations:** Nested JSON arrays in openings table

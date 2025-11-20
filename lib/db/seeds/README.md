# Database Seeding

This directory contains modular seed files for populating the database with initial data.

## Available Seeds

### Puzzles
- **File**: `puzzles.ts`
- **Status**: ✅ Complete (30 puzzles)
- **Rating Range**: 800-2150
- **Themes**: fork, pin, skewer, mate patterns, tactics
- **Run**: `pnpm db:seed puzzles`

### Openings
- **File**: `openings.ts`
- **Status**: 📝 TODO (placeholder created)
- **Run**: `pnpm db:seed openings`

## Usage

### Seed Everything
```bash
pnpm db:seed
```

### Seed Specific Data
```bash
# Seed only puzzles
pnpm db:seed puzzles

# Seed only openings
pnpm db:seed openings

# Seed multiple specific seeds
pnpm db:seed puzzles openings
```

## Creating New Seeds

1. **Create a new seed file** in this directory (e.g., `games.ts`)

```typescript
import { db } from "../index"
import { games } from "../schema"

export const gameData = [
  // Your seed data here
]

export async function seedGames() {
  console.log("♟️  Seeding games...")

  try {
    // Check if data already exists
    const existing = await db.select().from(games).limit(1)

    if (existing.length > 0) {
      console.log("   ⚠️  Games already exist. Skipping.")
      return { success: true, count: 0, skipped: true }
    }

    // Insert data
    const inserted = await db.insert(games).values(gameData).returning()

    console.log(`   ✅ Inserted ${inserted.length} games`)

    return { success: true, count: inserted.length, skipped: false }
  } catch (error) {
    console.error("   ❌ Error seeding games:", error)
    throw error
  }
}
```

2. **Register your seed** in `../seed.ts`:

```typescript
import { seedGames } from "./seeds/games"

const seeds = {
  puzzles: seedPuzzles,
  openings: seedOpenings,
  games: seedGames, // Add your seed here
}
```

3. **Run your seed**:
```bash
pnpm db:seed games
```

## Seed Data Structure

Each seed file should:
- Export a `data` array containing the seed data
- Export a `seed` function that inserts the data
- Check if data already exists before inserting
- Return a result object: `{ success: boolean, count: number, skipped: boolean }`
- Use console.log for progress updates

## Notes

- Seeds are idempotent - they check if data exists before inserting
- Run `pnpm db:push` before seeding to ensure your schema is up to date
- Seeds run sequentially, not in parallel
- Failed seeds don't stop other seeds from running

## Future Seeds to Implement

- [ ] **Example Games** - Famous chess games for analysis practice
- [ ] **Opening Repertoire** - Popular opening lines with ECO codes
- [ ] **Endgame Positions** - Classic endgame studies
- [ ] **User Templates** - Demo accounts for testing

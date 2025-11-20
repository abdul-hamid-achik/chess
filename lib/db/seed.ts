#!/usr/bin/env tsx
/**
 * Database Seed Orchestrator
 *
 * Run all seed files or specific ones
 * Usage:
 *   pnpm db:seed              # Run all seeds
 *   pnpm db:seed puzzles      # Run only puzzles seed
 *   pnpm db:seed openings     # Run only openings seed
 */

import { seedPuzzles } from "./seeds/puzzles"
import { seedOpenings } from "./seeds/openings"

// Available seeds
const seeds = {
  puzzles: seedPuzzles,
  openings: seedOpenings,
  // Add more seeds here as you create them
}

type SeedName = keyof typeof seeds

async function runSeed(seedName: SeedName) {
  console.log(`\n🌱 Running ${seedName} seed...`)
  try {
    const result = await seeds[seedName]()
    if (result.skipped) {
      console.log(`   ⏭️  ${seedName} seed skipped\n`)
    } else {
      console.log(`   ✅ ${seedName} seed complete! (${result.count} records)\n`)
    }
    return result
  } catch (error) {
    console.error(`   ❌ ${seedName} seed failed:`, error)
    throw error
  }
}

async function runAllSeeds() {
  console.log("🌱 Starting database seeding...")
  console.log("=" .repeat(50))

  const results: Record<string, any> = {}

  for (const seedName of Object.keys(seeds) as SeedName[]) {
    try {
      results[seedName] = await runSeed(seedName)
    } catch (error) {
      console.error(`Failed to run ${seedName} seed`)
      // Continue with other seeds
    }
  }

  console.log("=" .repeat(50))
  console.log("🎉 Seeding complete!\n")

  // Summary
  console.log("📊 Summary:")
  for (const [name, result] of Object.entries(results)) {
    if (result.skipped) {
      console.log(`   ${name}: skipped`)
    } else {
      console.log(`   ${name}: ${result.count} records`)
    }
  }
  console.log()
}

// Main execution
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    // Run all seeds
    await runAllSeeds()
  } else {
    // Run specific seed(s)
    const requestedSeeds = args as SeedName[]

    for (const seedName of requestedSeeds) {
      if (seedName in seeds) {
        await runSeed(seedName)
      } else {
        console.error(`❌ Unknown seed: ${seedName}`)
        console.log(`Available seeds: ${Object.keys(seeds).join(", ")}`)
        process.exit(1)
      }
    }
  }

  console.log("✨ Done!")
  process.exit(0)
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("\n💥 Seeding failed:", error)
    process.exit(1)
  })
}

export { runSeed, runAllSeeds }

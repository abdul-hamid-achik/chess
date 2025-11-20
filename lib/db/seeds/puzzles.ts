import { db } from "../index"
import { puzzles } from "../schema"

/**
 * Puzzle Seed Data
 * Organized by difficulty level
 */
export const puzzleData = [
  // Beginner Puzzles (800-1000)
  {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: ["Bxf7+", "Kxf7", "Nxe5+"],
    rating: 800,
    themes: ["fork", "discovered-attack"],
    description: "Find the fork that wins material"
  },
  {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: ["Nxe5", "Nxe5", "d4"],
    rating: 850,
    themes: ["removal-of-defender"],
    description: "Remove the defender and win the knight"
  },
  {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2BPP3/5N2/PPP2PPP/RNBQK2R b KQkq - 0 4",
    moves: ["Nxe4", "Bxf7+", "Kxf7", "Nxe5+"],
    rating: 900,
    themes: ["fork", "discovered-attack"],
    description: "Win material with a powerful fork"
  },
  {
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5",
    moves: ["Bxf7+", "Kxf7", "Ng5+"],
    rating: 900,
    themes: ["fork", "royal-fork"],
    description: "Sacrifice and fork to win the queen"
  },
  {
    fen: "r1bqkb1r/pppp1ppp/2n5/4p2Q/2B1n3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 5",
    moves: ["Qxf7#"],
    rating: 850,
    themes: ["mate-in-1", "back-rank"],
    description: "Checkmate in one move!"
  },

  // Intermediate Puzzles (1000-1400)
  {
    fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 6 8",
    moves: ["Bxf7+", "Rxf7", "Ng5"],
    rating: 1100,
    themes: ["deflection", "pin"],
    description: "Deflect and pin to win material"
  },
  {
    fen: "r2qkb1r/ppp2ppp/2n5/3pPb2/3Pn3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 8",
    moves: ["Nxe4", "Bxd1", "Bb5", "Bxe4", "Nxe4"],
    rating: 1200,
    themes: ["exchange", "pin"],
    description: "Trade pieces favorably"
  },
  {
    fen: "r1bqr1k1/ppp2pbp/2np1np1/4p3/2B1P3/2NP1N1P/PPP2PP1/R1BQR1K1 w - - 0 10",
    moves: ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Qb3+"],
    rating: 1300,
    themes: ["royal-fork", "discovered-attack"],
    description: "Win the queen with a tactical sequence"
  },
  {
    fen: "r1bqk2r/ppp2ppp/2n5/2bpp3/4P3/2PP1N2/PP1N1PPP/R1BQKB1R w KQkq - 0 7",
    moves: ["dxe4", "Bxf2+", "Kxf2", "Qxd2+"],
    rating: 1100,
    themes: ["deflection", "pin"],
    description: "Use deflection to win material"
  },
  {
    fen: "r2qkb1r/pppb1ppp/2np1n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 6",
    moves: ["Ng5", "d5", "exd5", "Nxd5", "Nxf7"],
    rating: 1400,
    themes: ["knight-fork", "tactics"],
    description: "Tactical blow wins material"
  },
  {
    fen: "r1b1k2r/ppppqppp/2n2n2/2b5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 7",
    moves: ["Nd5", "Qd8", "Nxc7+"],
    rating: 1200,
    themes: ["fork", "royal-fork"],
    description: "Fork to win the exchange"
  },

  // Advanced Puzzles (1400-1700)
  {
    fen: "r2q1rk1/ppp2ppp/2n1bn2/2bpp3/4P3/2PP1N2/PPBN1PPP/R1BQ1RK1 w - - 0 10",
    moves: ["Nxe5", "Nxe5", "d4", "Bb6", "dxe5"],
    rating: 1500,
    themes: ["removal-of-defender", "tactics"],
    description: "Remove defenders to win material"
  },
  {
    fen: "r1bq1rk1/pp3pbp/2n1pnp1/2ppP3/3P4/2PB1N2/PP1N1PPP/R1BQ1RK1 w - - 0 11",
    moves: ["Bxg6", "hxg6", "Nf4"],
    rating: 1600,
    themes: ["sacrifice", "weakness"],
    description: "Sacrifice to exploit weaknesses"
  },
  {
    fen: "r2qk2r/ppp2ppp/2npbn2/2b1p3/2B1P3/3P1N2/PPP1NPPP/R1BQK2R w KQkq - 0 8",
    moves: ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Ne6"],
    rating: 1550,
    themes: ["fork", "trapped-piece"],
    description: "Trap the queen with precise moves"
  },
  {
    fen: "r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 6 9",
    moves: ["e4", "dxe4", "Nxe4"],
    rating: 1450,
    themes: ["opening", "center-control"],
    description: "Control the center with tactics"
  },
  {
    fen: "r1bqk2r/pp3ppp/2n1pn2/2pp4/1b1P4/2NBPN2/PP1B1PPP/R2QK2R w KQkq - 2 9",
    moves: ["e4", "Nxe4", "Nxe4", "dxe4", "Bxe4"],
    rating: 1650,
    themes: ["tactics", "opening"],
    description: "Open the center tactically"
  },

  // Expert Puzzles (1700-2000)
  {
    fen: "r2q1rk1/1ppb1ppp/p1nb1n2/3p4/3P1B2/2N1PN2/PPQ2PPP/R3KB1R w KQ - 3 11",
    moves: ["Bxf6", "Bxf6", "Nd5"],
    rating: 1750,
    themes: ["exchange", "positional"],
    description: "Trade and centralize for advantage"
  },
  {
    fen: "r1b2rk1/pp2qppp/2n1pn2/2pp4/3P1B2/2PBPN2/PP1N1PPP/R2Q1RK1 w - - 0 12",
    moves: ["Bxf6", "Qxf6", "dxc5"],
    rating: 1800,
    themes: ["simplification", "tactics"],
    description: "Simplify and win the pawn"
  },
  {
    fen: "r1bq1rk1/pp2nppp/2n1p3/2ppP3/3P4/2PB1N2/PP1N1PPP/R1BQ1RK1 w - - 0 11",
    moves: ["Bxh7+", "Kxh7", "Ng5+", "Kg8", "Qh5"],
    rating: 1900,
    themes: ["sacrifice", "attack"],
    description: "Greek gift sacrifice leads to mate"
  },
  {
    fen: "r1b1k2r/ppppqppp/2n2n2/2b5/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 6 7",
    moves: ["Nd5", "Qd6", "Bb5"],
    rating: 1700,
    themes: ["pin", "tactics"],
    description: "Pin and pressure to win material"
  },
  {
    fen: "r2qkb1r/ppp2ppp/2n2n2/3p4/3P4/2N1P3/PP3PPP/R1BQKB1R w KQkq - 0 8",
    moves: ["e4", "dxe4", "d5", "exf3", "dxc6"],
    rating: 1850,
    themes: ["tactics", "pawn-breakthrough"],
    description: "Break through with pawns"
  },
  {
    fen: "r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2NBPN2/PP3PPP/R1BQK2R w KQ - 0 9",
    moves: ["a3", "Bxc3+", "bxc3"],
    rating: 1750,
    themes: ["exchange", "positional"],
    description: "Trade the bishop pair advantageously"
  },

  // Master Puzzles (2000+)
  {
    fen: "r1bq1rk1/pp3pbp/2np1np1/2p1p3/2P1P3/2NP1NP1/PP2PPBP/R1BQ1RK1 w - - 0 10",
    moves: ["d4", "cxd4", "Nxd4", "Nxd4", "Qxd4"],
    rating: 2000,
    themes: ["opening", "center-control"],
    description: "Open the center precisely"
  },
  {
    fen: "r2q1rk1/1pp2ppp/p1np1n2/4p1B1/1b1PP3/2N2N2/PPP1QPPP/R3KB1R w KQ - 2 10",
    moves: ["Bxf6", "gxf6", "Nh4"],
    rating: 2050,
    themes: ["weakness", "attack"],
    description: "Exploit kingside weaknesses"
  },
  {
    fen: "r1b2rk1/ppq2ppp/2n1pn2/2pp4/3P1B2/2PBPN2/PP1N1PPP/R2Q1RK1 w - - 0 12",
    moves: ["e4", "dxe4", "Nxe4", "Nxe4", "Bxe4"],
    rating: 2100,
    themes: ["center-attack", "tactics"],
    description: "Central breakthrough with precision"
  },
  {
    fen: "r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 9",
    moves: ["e4", "dxe4", "d5", "exf3", "dxc6", "fxg2", "cxb7"],
    rating: 2150,
    themes: ["tactics", "calculation"],
    description: "Calculate the complex tactical line"
  },
  {
    fen: "r2q1rk1/1ppb1ppp/p1np1n2/4p1B1/2PPP3/2N2N2/PP2QPPP/R3KB1R w KQ - 0 11",
    moves: ["e5", "dxe5", "dxe5", "Nd5", "Nxd5"],
    rating: 2000,
    themes: ["pawn-breakthrough", "tactics"],
    description: "Push the pawns with tactics"
  },
]

/**
 * Seed puzzles into the database
 */
export async function seedPuzzles() {
  console.log("🧩 Seeding puzzles...")

  try {
    // Check if puzzles already exist
    const existingPuzzles = await db.select().from(puzzles).limit(1)

    if (existingPuzzles.length > 0) {
      console.log("   ⚠️  Puzzles already exist. Skipping.")
      return { success: true, count: 0, skipped: true }
    }

    // Insert all puzzles
    const inserted = await db.insert(puzzles).values(puzzleData).returning()

    console.log(`   ✅ Inserted ${inserted.length} puzzles`)
    console.log(`   📊 Rating range: 800-2150`)

    return { success: true, count: inserted.length, skipped: false }
  } catch (error) {
    console.error("   ❌ Error seeding puzzles:", error)
    throw error
  }
}

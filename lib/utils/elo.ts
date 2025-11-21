/**
 * ELO Rating System
 *
 * Calculates rating changes based on game results using the standard ELO formula.
 * Formula: NewRating = OldRating + K * (ActualScore - ExpectedScore)
 *
 * K-factor determines how much ratings can change per game:
 * - 32: New players (< 30 games) or rating < 2100
 * - 24: Intermediate players (30-100 games)
 * - 16: Established players (> 100 games) or rating > 2400
 */

export type GameResult = "win" | "loss" | "draw"

/**
 * Calculate the expected score for a player based on rating difference
 * @param playerRating - The player's current rating
 * @param opponentRating - The opponent's current rating
 * @returns Expected score between 0 and 1
 */
export function calculateExpectedScore(
  playerRating: number,
  opponentRating: number
): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400))
}

/**
 * Determine K-factor based on player rating and games played
 * @param rating - Player's current rating
 * @param gamesPlayed - Total games played (optional, defaults to use rating-based K)
 * @returns K-factor value
 */
export function getKFactor(rating: number, gamesPlayed?: number): number {
  // If games played is provided, use experience-based K-factor
  if (gamesPlayed !== undefined) {
    if (gamesPlayed < 30) return 32
    if (gamesPlayed < 100) return 24
    return 16
  }

  // Otherwise, use rating-based K-factor
  if (rating < 2100) return 32
  if (rating < 2400) return 24
  return 16
}

/**
 * Calculate ELO rating change for a single game
 * @param playerRating - Player's current rating
 * @param opponentRating - Opponent's current rating
 * @param result - Game result from player's perspective
 * @param kFactor - K-factor (optional, will be calculated based on rating if not provided)
 * @returns Rating change (positive for gain, negative for loss)
 */
export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  result: GameResult,
  kFactor?: number
): number {
  // Calculate expected score
  const expectedScore = calculateExpectedScore(playerRating, opponentRating)

  // Convert result to actual score
  const actualScore = result === "win" ? 1 : result === "draw" ? 0.5 : 0

  // Use provided K-factor or calculate based on rating
  const k = kFactor ?? getKFactor(playerRating)

  // Calculate rating change
  const ratingChange = k * (actualScore - expectedScore)

  // Round to nearest integer
  return Math.round(ratingChange)
}

/**
 * Calculate new ratings for both players after a game
 * @param whiteRating - White player's current rating
 * @param blackRating - Black player's current rating
 * @param result - Game result ("white" = white wins, "black" = black wins, "draw" = draw)
 * @param whiteKFactor - K-factor for white (optional)
 * @param blackKFactor - K-factor for black (optional)
 * @returns Object with rating changes and new ratings for both players
 */
export function calculateBothRatings(
  whiteRating: number,
  blackRating: number,
  result: "white" | "black" | "draw",
  whiteKFactor?: number,
  blackKFactor?: number
): {
  whiteChange: number
  blackChange: number
  whiteNewRating: number
  blackNewRating: number
} {
  // Determine result from each player's perspective
  const whiteResult: GameResult =
    result === "white" ? "win" : result === "black" ? "loss" : "draw"
  const blackResult: GameResult =
    result === "black" ? "win" : result === "white" ? "loss" : "draw"

  // Calculate rating changes
  const whiteChange = calculateEloChange(
    whiteRating,
    blackRating,
    whiteResult,
    whiteKFactor
  )
  const blackChange = calculateEloChange(
    blackRating,
    whiteRating,
    blackResult,
    blackKFactor
  )

  return {
    whiteChange,
    blackChange,
    whiteNewRating: whiteRating + whiteChange,
    blackNewRating: blackRating + blackChange,
  }
}

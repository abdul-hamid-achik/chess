import type { Chess } from "chess.js"

export type Difficulty = "Basic" | "Intermediate" | "Advanced" | "Pro"

const PIECE_VALUES: Record<string, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
}

// Simple piece-square tables (simplified for brevity)
// Higher numbers mean better positions for White.
// For Black, we mirror or invert.
const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 5, 5, 5, 5, 5, 5, 5],
  [1, 1, 2, 3, 3, 2, 1, 1],
  [0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5],
  [0, 0, 0, 2, 2, 0, 0, 0],
  [0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5],
  [0.5, 1, 1, -2, -2, 1, 1, 0.5],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

const KNIGHT_TABLE = [
  [-5, -4, -3, -3, -3, -3, -4, -5],
  [-4, -2, 0, 0, 0, 0, -2, -4],
  [-3, 0, 1, 1.5, 1.5, 1, 0, -3],
  [-3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3],
  [-3, 0, 1.5, 2, 2, 1.5, 0, -3],
  [-3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3],
  [-4, -2, 0, 0.5, 0.5, 0, -2, -4],
  [-5, -4, -3, -3, -3, -3, -4, -5],
]

const BISHOP_TABLE = [
  [-2, -1, -1, -1, -1, -1, -1, -2],
  [-1, 0, 0, 0, 0, 0, 0, -1],
  [-1, 0, 0.5, 1, 1, 0.5, 0, -1],
  [-1, 0.5, 0.5, 1, 1, 0.5, 0.5, -1],
  [-1, 0, 1, 1, 1, 1, 0, -1],
  [-1, 1, 1, 1, 1, 1, 1, -1],
  [-1, 0.5, 0, 0, 0, 0, 0.5, -1],
  [-2, -1, -1, -1, -1, -1, -1, -2],
]

const ROOK_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0.5, 1, 1, 1, 1, 1, 1, 0.5],
  [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
  [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
  [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
  [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
  [-0.5, 0, 0, 0, 0, 0, 0, -0.5],
  [0, 0, 0, 0.5, 0.5, 0, 0, 0],
]

const QUEEN_TABLE = [
  [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
  [-1, 0, 0, 0, 0, 0, 0, -1],
  [-1, 0, 0.5, 0.5, 0.5, 0.5, 0, -1],
  [-0.5, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
  [0, 0, 0.5, 0.5, 0.5, 0.5, 0, -0.5],
  [-1, 0.5, 0.5, 0.5, 0.5, 0.5, 0, -1],
  [-1, 0, 0.5, 0, 0, 0, 0, -1],
  [-2, -1, -1, -0.5, -0.5, -1, -1, -2],
]

const KING_TABLE = [
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-3, -4, -4, -5, -5, -4, -4, -3],
  [-2, -3, -3, -4, -4, -3, -3, -2],
  [-1, -2, -2, -2, -2, -2, -2, -1],
  [2, 2, 0, 0, 0, 0, 2, 2],
  [2, 3, 1, 0, 0, 1, 3, 2],
]

/**
 * Evaluates the current board position
 * Returns positive values for White advantage, negative for Black advantage
 */
function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === "w" ? -10000 : 10000
  }
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
    return 0
  }

  let totalEvaluation = 0
  const board = game.board()

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j]
      if (piece) {
        const value = PIECE_VALUES[piece.type]
        let positionValue = 0
        const x = piece.color === "w" ? j : 7 - j
        const y = piece.color === "w" ? i : 7 - i

        switch (piece.type) {
          case "p":
            positionValue = PAWN_TABLE[y][x]
            break
          case "n":
            positionValue = KNIGHT_TABLE[y][x]
            break
          case "b":
            positionValue = BISHOP_TABLE[y][x]
            break
          case "r":
            positionValue = ROOK_TABLE[y][x]
            break
          case "q":
            positionValue = QUEEN_TABLE[y][x]
            break
          case "k":
            positionValue = KING_TABLE[y][x]
            break
        }

        if (piece.color === "w") {
          totalEvaluation += value + positionValue
        } else {
          totalEvaluation -= value + positionValue
        }
      }
    }
  }
  return totalEvaluation
}

/**
 * Minimax algorithm with alpha-beta pruning
 * @param game - Current chess game instance
 * @param depth - How many moves to look ahead
 * @param alpha - Best value for maximizing player
 * @param beta - Best value for minimizing player
 * @param isMaximizingPlayer - Whether current player is maximizing
 */
function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game)
  }

  const moves = game.moves()

  if (isMaximizingPlayer) {
    let maxEval = Number.NEGATIVE_INFINITY
    for (const move of moves) {
      game.move(move)
      const evalValue = minimax(game, depth - 1, alpha, beta, false)
      game.undo()
      maxEval = Math.max(maxEval, evalValue)
      alpha = Math.max(alpha, evalValue)
      if (beta <= alpha) break // Alpha-beta pruning
    }
    return maxEval
  } else {
    let minEval = Number.POSITIVE_INFINITY
    for (const move of moves) {
      game.move(move)
      const evalValue = minimax(game, depth - 1, alpha, beta, true)
      game.undo()
      minEval = Math.min(minEval, evalValue)
      beta = Math.min(beta, evalValue)
      if (beta <= alpha) break // Alpha-beta pruning
    }
    return minEval
  }
}

/**
 * Gets the best move for the AI based on difficulty level
 * @param game - Current chess game instance
 * @param difficulty - AI difficulty level
 * @returns Best move string or null if no moves available
 */
export function getBestMove(game: Chess, difficulty: Difficulty): string | null {
  const moves = game.moves()
  if (moves.length === 0) return null

  // Basic: Random moves
  if (difficulty === "Basic") {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  // Set search depth based on difficulty
  const depth = difficulty === "Intermediate" ? 1 : difficulty === "Advanced" ? 2 : 3

  const isWhite = game.turn() === "w"
  let bestMove = null
  let bestEval = isWhite ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY

  // Shuffle moves for variety when evaluations are equal
  const shuffledMoves = moves.sort(() => Math.random() - 0.5)

  for (const move of shuffledMoves) {
    game.move(move)
    // After bot's move, opponent plays next: White maximizes, Black minimizes
    const boardValue = minimax(game, depth - 1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, !isWhite)
    game.undo()

    if (isWhite ? boardValue > bestEval : boardValue < bestEval) {
      bestEval = boardValue
      bestMove = move
    }
  }

  return bestMove || moves[0]
}

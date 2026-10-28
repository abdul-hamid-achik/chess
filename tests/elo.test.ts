import { describe, it, expect } from 'vitest'
import {
  calculateExpectedScore,
  getKFactor,
  calculateEloChange,
  calculateBothRatings,
} from '../lib/utils/elo'

describe('ELO Rating System', () => {
  describe('calculateExpectedScore', () => {
    it('should return 0.5 when both players have equal ratings', () => {
      const result = calculateExpectedScore(1200, 1200)
      expect(result).toBe(0.5)
    })

    it('should return higher expected score for higher rated player', () => {
      const result = calculateExpectedScore(1400, 1200)
      expect(result).toBeGreaterThan(0.5)
    })

    it('should return lower expected score for lower rated player', () => {
      const result = calculateExpectedScore(1000, 1400)
      expect(result).toBeLessThan(0.5)
    })

    it('should handle large rating differences', () => {
      const result = calculateExpectedScore(2800, 1000)
      expect(result).toBeGreaterThan(0.99)
    })

    it('should return 0 for extremely lower rated player', () => {
      const result = calculateExpectedScore(100, 3000)
      expect(result).toBeCloseTo(0, 5)
    })
  })

  describe('getKFactor', () => {
    it('should return 32 for players below 2100 rating', () => {
      expect(getKFactor(1200)).toBe(32)
      expect(getKFactor(2099)).toBe(32)
    })

    it('should return 24 for players between 2100 and 2400', () => {
      expect(getKFactor(2100)).toBe(24)
      expect(getKFactor(2399)).toBe(24)
    })

    it('should return 16 for players 2400 and above', () => {
      expect(getKFactor(2400)).toBe(16)
      expect(getKFactor(3000)).toBe(16)
    })

    it('should use experience-based K when gamesPlayed provided', () => {
      expect(getKFactor(2500, 10)).toBe(32)
      expect(getKFactor(2500, 50)).toBe(24)
      expect(getKFactor(2500, 150)).toBe(16)
    })
  })

  describe('calculateEloChange', () => {
    it('should return positive change for a win', () => {
      const change = calculateEloChange(1200, 1200, 'win')
      expect(change).toBeGreaterThan(0)
    })

    it('should return negative change for a loss', () => {
      const change = calculateEloChange(1200, 1200, 'loss')
      expect(change).toBeLessThan(0)
    })

    it('should return zero for a draw between equal players', () => {
      const change = calculateEloChange(1200, 1200, 'draw')
      expect(change).toBe(0)
    })

    it('should return larger positive change for upset win', () => {
      const change = calculateEloChange(1000, 1400, 'win')
      expect(change).toBeGreaterThan(20)
    })

    it('should return smaller positive change for expected win', () => {
      const change = calculateEloChange(1400, 1000, 'win')
      expect(change).toBeLessThan(20)
    })

    it('should use custom K-factor when provided', () => {
      const change = calculateEloChange(1200, 1200, 'win', 16)
      expect(change).toBe(8)
    })
  })

  describe('calculateBothRatings', () => {
    it('should calculate correct ratings for white win', () => {
      const result = calculateBothRatings(1200, 1200, 'white')
      expect(result.whiteChange).toBeGreaterThan(0)
      expect(result.blackChange).toBeLessThan(0)
      expect(Math.abs(result.whiteChange)).toBe(Math.abs(result.blackChange))
      expect(result.whiteNewRating).toBe(1200 + result.whiteChange)
      expect(result.blackNewRating).toBe(1200 + result.blackChange)
    })

    it('should calculate correct ratings for black win', () => {
      const result = calculateBothRatings(1200, 1200, 'black')
      expect(result.blackChange).toBeGreaterThan(0)
      expect(result.whiteChange).toBeLessThan(0)
    })

    it('should calculate correct ratings for draw', () => {
      const result = calculateBothRatings(1200, 1200, 'draw')
      expect(result.whiteChange).toBe(0)
      expect(result.blackChange).toBe(0)
    })

    it('should handle mismatched ratings', () => {
      const result = calculateBothRatings(1400, 1000, 'white')
      expect(result.whiteChange).toBeGreaterThan(0)
      expect(result.blackChange).toBeLessThan(0)
      expect(Math.abs(result.whiteChange)).toBe(Math.abs(result.blackChange))
    })

    it('should handle custom K-factors', () => {
      const result = calculateBothRatings(1200, 1200, 'white', 32, 32)
      expect(result.whiteChange).toBe(16)
      expect(result.blackChange).toBe(-16)
    })
  })
})

"use server"

import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { openings, userOpenings } from "@/lib/db/schema"
import { eq, and, ilike, or, desc, inArray, sql, asc } from "drizzle-orm"
import type { NewUserOpening } from "@/lib/db/schema"

/**
 * Get all openings with optional filters
 */
export async function getAllOpenings(filters?: {
  searchTerm?: string
  color?: "w" | "b" | "both"
  ecoCode?: string
  difficultyLevel?: "beginner" | "intermediate" | "advanced" | "master"
  themes?: string[]
  sortBy?: "name" | "popularity" | "difficulty" | "recent"
  sortOrder?: "asc" | "desc"
}) {
  try {
    let query = db.select().from(openings)
    const conditions = []

    // Apply search filter if provided
    if (filters?.searchTerm) {
      const searchPattern = `%${filters.searchTerm}%`
      conditions.push(
        or(
          ilike(openings.name, searchPattern),
          ilike(openings.eco, searchPattern),
          ilike(openings.description, searchPattern)
        )
      )
    }

    // Apply ECO code filter if provided
    if (filters?.ecoCode) {
      conditions.push(eq(openings.eco, filters.ecoCode))
    }

    // Apply difficulty filter if provided
    if (filters?.difficultyLevel) {
      conditions.push(eq(openings.difficultyLevel, filters.difficultyLevel))
    }

    // Apply theme filter if provided (at least one matching theme)
    if (filters?.themes && filters.themes.length > 0) {
      conditions.push(
        sql`${openings.themes}::jsonb ?| array[${sql.join(
          filters.themes.map((theme) => sql`${theme}`),
          sql`, `
        )}]`
      )
    }

    // Combine all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "name"
    const sortOrder = filters?.sortOrder || "asc"

    switch (sortBy) {
      case "popularity":
        query = (sortOrder === "desc"
          ? query.orderBy(desc(openings.popularity))
          : query.orderBy(asc(openings.popularity))) as typeof query
        break
      case "difficulty":
        query = (sortOrder === "desc"
          ? query.orderBy(desc(openings.difficultyLevel))
          : query.orderBy(asc(openings.difficultyLevel))) as typeof query
        break
      case "recent":
        query = (sortOrder === "desc"
          ? query.orderBy(desc(openings.createdAt))
          : query.orderBy(asc(openings.createdAt))) as typeof query
        break
      case "name":
      default:
        query = (sortOrder === "desc"
          ? query.orderBy(desc(openings.name))
          : query.orderBy(asc(openings.name))) as typeof query
        break
    }

    const allOpenings = await query

    return { success: true, openings: allOpenings }
  } catch (error) {
    console.error("Error fetching openings:", error)
    return { error: "Failed to fetch openings", openings: [] }
  }
}

/**
 * Get a single opening by ID
 */
export async function getOpeningById(openingId: string) {
  try {
    const [opening] = await db
      .select()
      .from(openings)
      .where(eq(openings.id, openingId))
      .limit(1)

    if (!opening) {
      return { error: "Opening not found", opening: null }
    }

    return { success: true, opening }
  } catch (error) {
    console.error("Error fetching opening:", error)
    return { error: "Failed to fetch opening", opening: null }
  }
}

/**
 * Get user's opening repertoire
 */
export async function getUserOpenings() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "You must be signed in to view your repertoire", openings: [] }
    }

    // Join userOpenings with openings table to get full opening details
    const userRepertoire = await db
      .select({
        id: userOpenings.id,
        userId: userOpenings.userId,
        openingId: userOpenings.openingId,
        color: userOpenings.color,
        notes: userOpenings.notes,
        timesPlayed: userOpenings.timesPlayed,
        lastPracticed: userOpenings.lastPracticed,
        createdAt: userOpenings.createdAt,
        opening: {
          id: openings.id,
          name: openings.name,
          eco: openings.eco,
          moves: openings.moves,
          fen: openings.fen,
          description: openings.description,
          variations: openings.variations,
          popularity: openings.popularity,
          difficultyLevel: openings.difficultyLevel,
          themes: openings.themes,
          winRate: openings.winRate,
          drawRate: openings.drawRate,
          lossRate: openings.lossRate,
        },
      })
      .from(userOpenings)
      .innerJoin(openings, eq(userOpenings.openingId, openings.id))
      .where(eq(userOpenings.userId, session.user.id))
      .orderBy(desc(userOpenings.createdAt))

    return { success: true, openings: userRepertoire }
  } catch (error) {
    console.error("Error fetching user openings:", error)
    return { error: "Failed to fetch your repertoire", openings: [] }
  }
}

/**
 * Add an opening to user's repertoire
 */
export async function addToRepertoire(data: {
  openingId: string
  color: "w" | "b"
  notes?: string
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "You must be signed in to add to your repertoire" }
    }

    // Check if opening already exists in user's repertoire
    const existing = await db
      .select()
      .from(userOpenings)
      .where(
        and(
          eq(userOpenings.userId, session.user.id),
          eq(userOpenings.openingId, data.openingId),
          eq(userOpenings.color, data.color)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      return { error: "This opening is already in your repertoire for this color" }
    }

    const newUserOpening: NewUserOpening = {
      userId: session.user.id,
      openingId: data.openingId,
      color: data.color,
      notes: data.notes || null,
      timesPlayed: 0,
      lastPracticed: null,
    }

    const [inserted] = await db
      .insert(userOpenings)
      .values(newUserOpening)
      .returning()

    if (!inserted) {
      return { error: "Failed to add opening to repertoire" }
    }

    return { success: true, userOpening: inserted }
  } catch (error) {
    console.error("Error adding opening to repertoire:", error)
    return { error: "Failed to add opening to repertoire" }
  }
}

/**
 * Remove an opening from user's repertoire
 */
export async function removeFromRepertoire(userOpeningId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "You must be signed in to remove from your repertoire" }
    }

    // Verify ownership before deleting
    const [userOpening] = await db
      .select()
      .from(userOpenings)
      .where(
        and(
          eq(userOpenings.id, userOpeningId),
          eq(userOpenings.userId, session.user.id)
        )
      )
      .limit(1)

    if (!userOpening) {
      return { error: "Opening not found in your repertoire" }
    }

    await db
      .delete(userOpenings)
      .where(eq(userOpenings.id, userOpeningId))

    return { success: true }
  } catch (error) {
    console.error("Error removing opening from repertoire:", error)
    return { error: "Failed to remove opening from repertoire" }
  }
}

/**
 * Update notes for a user's opening
 */
export async function updateOpeningNotes(userOpeningId: string, notes: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "You must be signed in to update notes" }
    }

    // Verify ownership before updating
    const [userOpening] = await db
      .select()
      .from(userOpenings)
      .where(
        and(
          eq(userOpenings.id, userOpeningId),
          eq(userOpenings.userId, session.user.id)
        )
      )
      .limit(1)

    if (!userOpening) {
      return { error: "Opening not found in your repertoire" }
    }

    const [updated] = await db
      .update(userOpenings)
      .set({ notes })
      .where(eq(userOpenings.id, userOpeningId))
      .returning()

    if (!updated) {
      return { error: "Failed to update notes" }
    }

    return { success: true, userOpening: updated }
  } catch (error) {
    console.error("Error updating opening notes:", error)
    return { error: "Failed to update notes" }
  }
}

/**
 * Update practice statistics for an opening
 */
export async function recordPracticeSession(userOpeningId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "You must be signed in to record practice" }
    }

    // Verify ownership before updating
    const [userOpening] = await db
      .select()
      .from(userOpenings)
      .where(
        and(
          eq(userOpenings.id, userOpeningId),
          eq(userOpenings.userId, session.user.id)
        )
      )
      .limit(1)

    if (!userOpening) {
      return { error: "Opening not found in your repertoire" }
    }

    const [updated] = await db
      .update(userOpenings)
      .set({
        timesPlayed: userOpening.timesPlayed + 1,
        lastPracticed: new Date(),
      })
      .where(eq(userOpenings.id, userOpeningId))
      .returning()

    if (!updated) {
      return { error: "Failed to record practice session" }
    }

    return { success: true, userOpening: updated }
  } catch (error) {
    console.error("Error recording practice session:", error)
    return { error: "Failed to record practice session" }
  }
}

/**
 * Get opening statistics (how many openings in repertoire, etc.)
 */
export async function getOpeningStats() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        error: "You must be signed in to view stats",
        stats: null,
      }
    }

    const repertoire = await db
      .select()
      .from(userOpenings)
      .where(eq(userOpenings.userId, session.user.id))

    const whiteOpenings = repertoire.filter((o) => o.color === "w").length
    const blackOpenings = repertoire.filter((o) => o.color === "b").length
    const totalPracticed = repertoire.reduce(
      (sum, o) => sum + o.timesPlayed,
      0
    )

    const recentlyPracticed = repertoire
      .filter((o) => o.lastPracticed !== null)
      .sort((a, b) => {
        if (!a.lastPracticed || !b.lastPracticed) return 0
        return b.lastPracticed.getTime() - a.lastPracticed.getTime()
      })
      .slice(0, 5)

    return {
      success: true,
      stats: {
        totalOpenings: repertoire.length,
        whiteOpenings,
        blackOpenings,
        totalPracticed,
        recentlyPracticed,
      },
    }
  } catch (error) {
    console.error("Error fetching opening stats:", error)
    return {
      error: "Failed to fetch stats",
      stats: null,
    }
  }
}

/**
 * Check if an opening is in user's repertoire
 */
export async function isInRepertoire(openingId: string, color: "w" | "b") {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { isInRepertoire: false }
    }

    const [existing] = await db
      .select()
      .from(userOpenings)
      .where(
        and(
          eq(userOpenings.userId, session.user.id),
          eq(userOpenings.openingId, openingId),
          eq(userOpenings.color, color)
        )
      )
      .limit(1)

    return { isInRepertoire: !!existing, userOpeningId: existing?.id }
  } catch (error) {
    console.error("Error checking repertoire:", error)
    return { isInRepertoire: false }
  }
}

/**
 * Get multiple openings by their IDs (for comparison)
 */
export async function getOpeningsByIds(openingIds: string[]) {
  try {
    if (!openingIds || openingIds.length === 0) {
      return { error: "No opening IDs provided", openings: [] }
    }

    if (openingIds.length > 5) {
      return { error: "Cannot compare more than 5 openings at once", openings: [] }
    }

    const selectedOpenings = await db
      .select()
      .from(openings)
      .where(inArray(openings.id, openingIds))

    if (selectedOpenings.length === 0) {
      return { error: "No openings found with the provided IDs", openings: [] }
    }

    return { success: true, openings: selectedOpenings }
  } catch (error) {
    console.error("Error fetching openings by IDs:", error)
    return { error: "Failed to fetch openings", openings: [] }
  }
}

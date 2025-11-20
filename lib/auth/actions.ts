"use server"

import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { signIn } from "./config"

export async function signUpUser(data: {
  name: string
  email: string
  password: string
}) {
  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        rating: 1200,
      })
      .returning()

    if (!newUser) {
      return { error: "Failed to create user" }
    }

    // Sign in the user
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    return { success: true, user: newUser }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function signInUser(data: { email: string; password: string }) {
  try {
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirectTo: "/play",
    })

    return { success: true }
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "Invalid email or password" }
  }
}

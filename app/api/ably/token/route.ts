import { auth } from "@/lib/auth/config"
import Ably from "ably"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY! })

    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: session.user.id,
      capability: {
        "game:*": ["subscribe", "presence"],
        "matchmaking:*": ["subscribe"],
      },
    })

    return Response.json(tokenRequest)
  } catch (error) {
    console.error("Failed to create Ably token:", error)
    return Response.json({ error: "Failed to create token" }, { status: 500 })
  }
}

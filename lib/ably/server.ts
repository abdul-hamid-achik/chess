import Ably from "ably"

let ablyServer: Ably.Rest | null = null

export function getAblyServer() {
  if (!ablyServer) {
    const apiKey = process.env.ABLY_API_KEY

    if (!apiKey) {
      throw new Error("ABLY_API_KEY is not configured")
    }

    ablyServer = new Ably.Rest({
      key: apiKey,
    })
  }

  return ablyServer
}

/**
 * Publish a message to an Ably channel (server-side)
 */
export async function publishToChannel(
  channelId: string,
  eventName: string,
  data: Record<string, unknown>
) {
  try {
    const ably = getAblyServer()
    const channel = ably.channels.get(channelId)
    await channel.publish(eventName, data)
  } catch (error) {
    console.error("Failed to publish to Ably channel:", error)
    throw error
  }
}

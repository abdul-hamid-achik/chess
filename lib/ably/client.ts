"use client"

import * as Ably from "ably"

let ablyClient: Ably.Realtime | null = null

export function getAblyClient(): Ably.Realtime {
  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      authUrl: "/api/ably/token",
    })
  }
  return ablyClient
}

export function useAblyChannel(channelName: string, _callback: (_message: Ably.Message) => void) {
  const client = getAblyClient()
  const channel = client.channels.get(channelName)

  channel.subscribe(_callback)

  return {
    channel,
    unsubscribe: () => channel.unsubscribe(_callback),
  }
}

import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth/config"
import { getOpeningById, isInRepertoire } from "@/lib/actions/openings"
import { OpeningDetailView } from "@/components/features/learn/opening-detail-view"

export default async function OpeningDetailPage({
  params,
}: {
  params: Promise<{ openingId: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/sign-in")
  }

  const resolvedParams = await params
  const result = await getOpeningById(resolvedParams.openingId)

  if (result.error || !result.opening) {
    notFound()
  }

  // Check if opening is in repertoire for both colors
  const whiteRepertoire = await isInRepertoire(result.opening.id, "w")
  const blackRepertoire = await isInRepertoire(result.opening.id, "b")

  const inRepertoire = {
    white: whiteRepertoire.isInRepertoire,
    black: blackRepertoire.isInRepertoire,
    whiteId: whiteRepertoire.userOpeningId,
    blackId: blackRepertoire.userOpeningId,
  }

  return (
    <OpeningDetailView
      opening={result.opening}
      userId={session.user.id}
      inRepertoire={inRepertoire}
    />
  )
}

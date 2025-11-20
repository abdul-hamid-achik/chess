"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { BookmarkX, Edit2, Save, X, Loader2, BookOpen } from "lucide-react"
import { getUserOpenings, removeFromRepertoire, updateOpeningNotes } from "@/lib/actions/openings"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UserOpening {
  id: string
  userId: string
  openingId: string
  color: string
  notes: string | null
  timesPlayed: number
  lastPracticed: Date | null
  createdAt: Date
  opening: {
    id: string
    name: string
    eco: string | null
    moves: string[]
    fen: string
    description: string | null
    variations: Array<{ name: string; moves: string[] }> | null
  }
}

interface UserRepertoireProps {
  onOpeningClick?: (opening: UserOpening["opening"]) => void
  refreshTrigger?: number
}

export function UserRepertoire({ onOpeningClick, refreshTrigger }: UserRepertoireProps) {
  const [openings, setOpenings] = useState<UserOpening[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState("")
  const [removing, setRemoving] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false)
  const [selectedForRemoval, setSelectedForRemoval] = useState<UserOpening | null>(null)

  useEffect(() => {
    loadRepertoire()
  }, [refreshTrigger])

  const loadRepertoire = async () => {
    setLoading(true)
    try {
      const result = await getUserOpenings()
      if (result.success && result.openings) {
        setOpenings(result.openings)
      }
    } catch (error) {
      console.error("Error loading repertoire:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditNotes = (userOpening: UserOpening) => {
    setEditingId(userOpening.id)
    setEditNotes(userOpening.notes || "")
  }

  const handleSaveNotes = async (userOpeningId: string) => {
    setSaving(true)
    try {
      const result = await updateOpeningNotes(userOpeningId, editNotes)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Notes updated successfully")
        await loadRepertoire()
        setEditingId(null)
      }
    } catch (error) {
      toast.error("Failed to update notes")
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditNotes("")
  }

  const handleRemoveClick = (userOpening: UserOpening) => {
    setSelectedForRemoval(userOpening)
    setOpenRemoveDialog(true)
  }

  const handleConfirmRemove = async () => {
    if (!selectedForRemoval) return

    setRemoving(selectedForRemoval.id)
    try {
      const result = await removeFromRepertoire(selectedForRemoval.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Removed from repertoire")
        await loadRepertoire()
      }
    } catch (error) {
      toast.error("Failed to remove opening")
    } finally {
      setRemoving(null)
      setOpenRemoveDialog(false)
      setSelectedForRemoval(null)
    }
  }

  const whiteOpenings = openings.filter((o) => o.color === "w")
  const blackOpenings = openings.filter((o) => o.color === "b")

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (openings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Your repertoire is empty</p>
          <p className="text-sm text-muted-foreground text-center">
            Browse openings above and add them to your repertoire to start learning
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* White Openings */}
        {whiteOpenings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded-sm" />
                White Openings ({whiteOpenings.length})
              </CardTitle>
              <CardDescription>
                Openings you play as White
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {whiteOpenings.map((userOpening, index) => (
                <div key={userOpening.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className="font-semibold cursor-pointer hover:text-primary transition-colors"
                            onClick={() => onOpeningClick?.(userOpening.opening)}
                          >
                            {userOpening.opening.name}
                          </h4>
                          {userOpening.opening.eco && (
                            <Badge variant="secondary">
                              {userOpening.opening.eco}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {userOpening.opening.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Practiced: {userOpening.timesPlayed} times</span>
                          {userOpening.lastPracticed && (
                            <span>
                              Last: {new Date(userOpening.lastPracticed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {editingId !== userOpening.id && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditNotes(userOpening)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveClick(userOpening)}
                              disabled={removing === userOpening.id}
                            >
                              {removing === userOpening.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <BookmarkX className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Notes Section */}
                    {editingId === userOpening.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add your notes about this opening..."
                          rows={3}
                          disabled={saving}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(userOpening.id)}
                            disabled={saving}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : userOpening.notes ? (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {userOpening.notes}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Black Openings */}
        {blackOpenings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-800 border-2 border-gray-300 rounded-sm" />
                Black Openings ({blackOpenings.length})
              </CardTitle>
              <CardDescription>
                Openings you play as Black
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {blackOpenings.map((userOpening, index) => (
                <div key={userOpening.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4
                            className="font-semibold cursor-pointer hover:text-primary transition-colors"
                            onClick={() => onOpeningClick?.(userOpening.opening)}
                          >
                            {userOpening.opening.name}
                          </h4>
                          {userOpening.opening.eco && (
                            <Badge variant="secondary">
                              {userOpening.opening.eco}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {userOpening.opening.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Practiced: {userOpening.timesPlayed} times</span>
                          {userOpening.lastPracticed && (
                            <span>
                              Last: {new Date(userOpening.lastPracticed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {editingId !== userOpening.id && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditNotes(userOpening)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveClick(userOpening)}
                              disabled={removing === userOpening.id}
                            >
                              {removing === userOpening.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <BookmarkX className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Notes Section */}
                    {editingId === userOpening.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add your notes about this opening..."
                          rows={3}
                          disabled={saving}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(userOpening.id)}
                            disabled={saving}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : userOpening.notes ? (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {userOpening.notes}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={openRemoveDialog} onOpenChange={setOpenRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from repertoire?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{selectedForRemoval?.opening.name}</strong> from your{" "}
              {selectedForRemoval?.color === "w" ? "White" : "Black"} repertoire? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove} disabled={!!removing}>
              {removing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { formatMoveNumber, getClassificationVariant } from "@/lib/analysis-helpers"
import { MOVE_LABELS } from "@/types/analysis"
import type { MoveAnalysisData } from "@/types/analysis"

interface MoveAnalysisListProps {
  moves: MoveAnalysisData[]
  onMoveClick?: (_index: number) => void
  currentMoveIndex?: number
}

export function MoveAnalysisList({
  moves,
  onMoveClick,
  currentMoveIndex = -1,
}: MoveAnalysisListProps) {
  const getEvaluationDisplay = (evaluation: number, mate?: number) => {
    if (mate !== undefined) {
      return mate > 0 ? `M${mate}` : `M${Math.abs(mate)}`
    }
    const pawns = evaluation / 100
    const sign = pawns > 0 ? "+" : ""
    return `${sign}${pawns.toFixed(2)}`
  }

  const getEvaluationColor = (evaluation: number) => {
    if (evaluation > 200) return "text-green-500"
    if (evaluation > 50) return "text-blue-500"
    if (evaluation > -50) return "text-gray-500"
    if (evaluation > -200) return "text-orange-500"
    return "text-red-500"
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Move-by-Move Analysis</CardTitle>
        <CardDescription>
          Detailed breakdown of all {moves.length} moves
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {moves.map((move, index) => (
              <div key={index}>
                <Button
                  variant={currentMoveIndex === index ? "secondary" : "ghost"}
                  className="w-full justify-start p-3 h-auto hover:bg-accent"
                  onClick={() => onMoveClick?.(index)}
                >
                  <div className="flex items-center justify-between w-full gap-3">
                    {/* Move Number and Notation */}
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-mono text-muted-foreground min-w-[40px]">
                        {formatMoveNumber(index)}
                      </span>
                      <span className="font-semibold">{move.move}</span>
                      <Badge
                        variant={getClassificationVariant(move.classification)}
                        className="text-xs"
                      >
                        {MOVE_LABELS[move.classification]}
                      </Badge>
                    </div>

                    {/* Evaluation */}
                    <div className="flex items-center gap-2">
                      {move.evaluationAfter !== undefined && (
                        <span
                          className={`font-mono text-sm font-semibold ${getEvaluationColor(
                            move.evaluationAfter
                          )}`}
                        >
                          {getEvaluationDisplay(move.evaluationAfter)}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Button>

                {/* Show best move suggestion for mistakes/blunders */}
                {move.bestMove &&
                  (move.classification === "mistake" ||
                    move.classification === "blunder" ||
                    move.classification === "inaccuracy") && (
                    <div className="ml-12 mt-1 mb-2 text-xs text-muted-foreground">
                      <span>Best: </span>
                      <span className="font-semibold text-foreground">{move.bestMove}</span>
                      {move.delta && (
                        <span className="ml-2 text-red-500">
                          ({(move.delta / 100).toFixed(2)})
                        </span>
                      )}
                    </div>
                  )}

                {index < moves.length - 1 && <Separator className="my-1" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

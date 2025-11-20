"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RatingHistoryChart } from "./charts/rating-history-chart"
import { PerformanceDistributionChart } from "./charts/performance-distribution-chart"
import { TimeControlPerformanceChart } from "./charts/time-control-performance-chart"
import { ActivityChart } from "./charts/activity-chart"
import { PuzzleProgressChart } from "./charts/puzzle-progress-chart"
import {
  getRatingHistory,
  getPerformanceDistribution,
  getPerformanceByTimeControl,
  getGameActivityData,
  getPuzzleProgressData,
} from "@/lib/actions/statistics"
import { Loader2 } from "lucide-react"

type TimeRange = "7d" | "30d" | "all"

export function StatisticsSection() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    ratingHistory: any[]
    performanceDistribution: any
    timeControlPerformance: any[]
    gameActivity: any
    puzzleProgress: any[]
  }>({
    ratingHistory: [],
    performanceDistribution: { data: [], total: 0 },
    timeControlPerformance: [],
    gameActivity: { data: [], groupBy: "day" as const },
    puzzleProgress: [],
  })

  useEffect(() => {
    loadStatistics()
  }, [timeRange])

  const loadStatistics = async () => {
    setLoading(true)
    try {
      const [
        ratingHistoryRes,
        performanceDistRes,
        timeControlPerfRes,
        gameActivityRes,
        puzzleProgressRes,
      ] = await Promise.all([
        getRatingHistory(timeRange),
        getPerformanceDistribution(timeRange),
        getPerformanceByTimeControl(timeRange),
        getGameActivityData(timeRange),
        getPuzzleProgressData(timeRange),
      ])

      setData({
        ratingHistory: ratingHistoryRes.success ? ratingHistoryRes.data || [] : [],
        performanceDistribution: performanceDistRes.success
          ? { data: performanceDistRes.data || [], total: performanceDistRes.total || 0 }
          : { data: [], total: 0 },
        timeControlPerformance: timeControlPerfRes.success ? timeControlPerfRes.data || [] : [],
        gameActivity: gameActivityRes.success
          ? { data: gameActivityRes.data || [], groupBy: gameActivityRes.groupBy || "day" }
          : { data: [], groupBy: "day" as const },
        puzzleProgress: puzzleProgressRes.success ? puzzleProgressRes.data || [] : [],
      })
    } catch (error) {
      console.error("Error loading statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Performance Statistics</CardTitle>
            <CardDescription>Track your progress over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === "7d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("7d")}
            >
              Last 7 days
            </Button>
            <Button
              variant={timeRange === "30d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("30d")}
            >
              Last 30 days
            </Button>
            <Button
              variant={timeRange === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("all")}
            >
              All time
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Row 1: Rating History */}
            <RatingHistoryChart data={data.ratingHistory} />

            {/* Row 2: Performance Distribution & Time Control Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceDistributionChart
                data={data.performanceDistribution.data}
                total={data.performanceDistribution.total}
              />
              <TimeControlPerformanceChart data={data.timeControlPerformance} />
            </div>

            {/* Row 3: Activity & Puzzle Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityChart
                data={data.gameActivity.data}
                groupBy={data.gameActivity.groupBy}
              />
              <PuzzleProgressChart data={data.puzzleProgress} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

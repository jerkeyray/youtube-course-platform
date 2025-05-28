"use client"

import { useEffect, useState } from "react"
import { Flame } from "lucide-react"
import { useUser } from "@clerk/nextjs"

export default function StreakDisplay() {
  const { user, isLoaded } = useUser()
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) return

    const fetchStreak = async () => {
      try {
        const response = await fetch("/api/user/streak")
        if (!response.ok) throw new Error("Failed to fetch streak")
        const data = await response.json()
        setStreak(data.streakCount)
      } catch (error) {
        console.error("Error fetching streak:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStreak()
  }, [isLoaded, user])

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Flame className="h-4 w-4 text-orange-500" />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Flame className="h-4 w-4 text-orange-500" />
      <span>{streak} day streak</span>
    </div>
  )
}

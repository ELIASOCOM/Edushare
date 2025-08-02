"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, X, Star, Gift, Zap } from "lucide-react"

interface UserRetentionProps {
  user: any
  userStats?: {
    uploadsCount: number
    likesReceived: number
    downloadsCount: number
    joinDate: string
  }
}

export default function UserRetention({ user, userStats }: UserRetentionProps) {
  const [showWelcome, setShowWelcome] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievements, setAchievements] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      checkWelcomeMessage()
      checkAchievements()
    }
  }, [user, userStats])

  const checkWelcomeMessage = () => {
    const hasSeenWelcome = localStorage.getItem(`welcome_${user.id}`)
    if (!hasSeenWelcome) {
      setShowWelcome(true)
    }
  }

  const checkAchievements = () => {
    if (!userStats) return

    const newAchievements: string[] = []
    const existingAchievements = JSON.parse(localStorage.getItem(`achievements_${user.id}`) || "[]")

    // First upload achievement
    if (userStats.uploadsCount >= 1 && !existingAchievements.includes("first_upload")) {
      newAchievements.push("first_upload")
    }

    // Popular uploader
    if (userStats.likesReceived >= 10 && !existingAchievements.includes("popular_uploader")) {
      newAchievements.push("popular_uploader")
    }

    // Prolific contributor
    if (userStats.uploadsCount >= 5 && !existingAchievements.includes("prolific_contributor")) {
      newAchievements.push("prolific_contributor")
    }

    if (newAchievements.length > 0) {
      setAchievements(newAchievements)
      setShowAchievement(true)
      localStorage.setItem(`achievements_${user.id}`, JSON.stringify([...existingAchievements, ...newAchievements]))
    }
  }

  const dismissWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem(`welcome_${user.id}`, "true")
  }

  const dismissAchievement = () => {
    setShowAchievement(false)
  }

  const getAchievementDetails = (achievement: string) => {
    const details = {
      first_upload: {
        title: "First Contribution! 🎉",
        description: "Thank you for sharing your first resource with the community!",
        icon: <Star className="w-5 h-5 text-yellow-500" />,
      },
      popular_uploader: {
        title: "Popular Contributor! ⭐",
        description: "Your uploads have received 10+ likes from the community!",
        icon: <Gift className="w-5 h-5 text-purple-500" />,
      },
      prolific_contributor: {
        title: "Prolific Contributor! 🚀",
        description: "You've shared 5+ resources. You're amazing!",
        icon: <Zap className="w-5 h-5 text-blue-500" />,
      },
    }
    return details[achievement as keyof typeof details]
  }

  return (
    <>
      {/* Welcome Message */}
      {showWelcome && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-right">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Welcome to EduResources! 👋</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Ready to discover amazing educational resources? Start by exploring our library or uploading your
                    first PDF!
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                      Upload First PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={dismissWelcome} className="text-xs bg-transparent">
                      Got it!
                    </Button>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={dismissWelcome} className="h-6 w-6 p-0 text-blue-600">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Achievement Notifications */}
      {showAchievement && achievements.length > 0 && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-right">
          {achievements.map((achievement, index) => {
            const details = getAchievementDetails(achievement)
            return (
              <Card
                key={achievement}
                className="mb-2 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {details?.icon}
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 mb-1">{details?.title}</h3>
                        <p className="text-sm text-green-700">{details?.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={dismissAchievement}
                      className="h-6 w-6 p-0 text-green-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}

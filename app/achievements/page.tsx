"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AwardIcon, TrophyIcon, StarIcon, TargetIcon, BookOpenIcon, UploadIcon } from "lucide-react"

export default function AchievementsPage() {
  const achievements = [
    {
      id: 1,
      title: "First Upload",
      description: "Upload your first educational resource",
      icon: UploadIcon,
      unlocked: true,
      progress: 100,
      rarity: "common",
    },
    {
      id: 2,
      title: "Knowledge Sharer",
      description: "Upload 10 educational resources",
      icon: BookOpenIcon,
      unlocked: false,
      progress: 30,
      rarity: "uncommon",
    },
    {
      id: 3,
      title: "Community Favorite",
      description: "Receive 100 favorites on your resources",
      icon: StarIcon,
      unlocked: false,
      progress: 65,
      rarity: "rare",
    },
    {
      id: 4,
      title: "Master Educator",
      description: "Upload 50 high-quality resources",
      icon: TrophyIcon,
      unlocked: false,
      progress: 12,
      rarity: "epic",
    },
    {
      id: 5,
      title: "Download Champion",
      description: "Your resources reach 1000 downloads",
      icon: TargetIcon,
      unlocked: false,
      progress: 45,
      rarity: "legendary",
    },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500"
      case "uncommon":
        return "bg-green-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-200 dark:border-gray-700"
      case "uncommon":
        return "border-green-200 dark:border-green-800"
      case "rare":
        return "border-blue-200 dark:border-blue-800"
      case "epic":
        return "border-purple-200 dark:border-purple-800"
      case "legendary":
        return "border-orange-200 dark:border-orange-800"
      default:
        return "border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Achievements</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress and unlock rewards for contributing to the community
        </p>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">1</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Unlocked</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">4</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">250</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Points</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const Icon = achievement.icon
          return (
            <Card
              key={achievement.id}
              className={`bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-2 shadow-lg transition-all hover:shadow-xl ${
                achievement.unlocked
                  ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
                  : getRarityBorder(achievement.rarity)
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.unlocked ? "bg-green-500" : getRarityColor(achievement.rarity)
                    } ${achievement.unlocked ? "" : "opacity-50"}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={achievement.unlocked ? "default" : "secondary"}
                      className={`text-xs ${achievement.unlocked ? "bg-green-500" : ""}`}
                    >
                      {achievement.rarity}
                    </Badge>
                    {achievement.unlocked && <AwardIcon className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
                <CardTitle className={`text-lg ${achievement.unlocked ? "text-green-700 dark:text-green-300" : ""}`}>
                  {achievement.title}
                </CardTitle>
                <CardDescription className="text-sm">{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className={achievement.unlocked ? "text-green-600 font-medium" : ""}>
                      {achievement.progress}%
                    </span>
                  </div>
                  <Progress value={achievement.progress} className="h-2" />
                  {achievement.unlocked && (
                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
                      <TrophyIcon className="h-3 w-3" />
                      Unlocked!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Coming Soon */}
      <div className="mt-12 text-center">
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
          <CardContent className="py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">More Achievements Coming Soon!</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We're constantly adding new achievements and rewards. Keep contributing to the community to unlock
              exclusive badges and recognition.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

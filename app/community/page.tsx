"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UsersIcon, MessageCircleIcon, TrendingUpIcon, StarIcon, UserIcon } from "lucide-react"

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community Hub</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect with educators and learners from around the world</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Community Stats */}
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-blue-600" />
              Community Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Members</span>
              <Badge variant="secondary">12,847</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Resources Shared</span>
              <Badge variant="secondary">3,421</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Discussions</span>
              <Badge variant="secondary">8,765</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Discussions */}
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircleIcon className="h-5 w-5 text-green-600" />
              Recent Discussions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Best Calculus Resources?</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Started by @mathteacher • 23 replies</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Physics Lab Equipment</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Started by @physicist • 15 replies</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Online Learning Tips</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Started by @educator • 31 replies</p>
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-purple-600" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Dr. Sarah Johnson</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">127 resources shared</p>
              </div>
              <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Prof. Michael Chen</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">98 resources shared</p>
              </div>
              <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
          <CardContent className="py-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Join the Conversation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Connect with fellow educators, share your experiences, and discover new teaching methods. Our community is
              here to support your educational journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <MessageCircleIcon className="mr-2 h-4 w-4" />
                Start a Discussion
              </Button>
              <Button variant="outline">
                <UsersIcon className="mr-2 h-4 w-4" />
                Browse Groups
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { HeartIcon, DownloadIcon, EyeIcon, StarIcon, FileIcon, LoaderIcon, TrashIcon } from "lucide-react"
import { getUserFavorites, removeFromFavorites, trackDownload } from "@/lib/database"

export default function FavoritesPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadFavorites()
    }
  }, [user])

  const loadFavorites = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getUserFavorites(user.id)
      setFavorites(data || [])
    } catch (error) {
      console.error("Error loading favorites:", error)
      toast({
        title: "Error",
        description: "Failed to load favorites.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (resourceId: string) => {
    try {
      await removeFromFavorites(resourceId)
      setFavorites((prev) => prev.filter((fav) => fav.resource_id !== resourceId))
      toast({
        title: "Removed from favorites",
        description: "Resource removed from your favorites.",
      })
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast({
        title: "Error",
        description: "Failed to remove from favorites.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (resource: any) => {
    try {
      await trackDownload(resource.id)
      toast({
        title: "Download Started",
        description: `Downloading ${resource.name}`,
      })

      // Simulate download
      const link = document.createElement("a")
      link.href = resource.file_url
      link.download = resource.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Error",
        description: "Failed to download file.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your favorites</h1>
          <Button onClick={() => (window.location.href = "/auth/login")}>Sign In</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <LoaderIcon className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading favorites...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Favorites</h1>
        <p className="text-gray-600 dark:text-gray-400">Resources you've saved for later ({favorites.length} items)</p>
      </div>

      {favorites.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
          <CardContent className="text-center py-12">
            <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start exploring resources and add them to your favorites!
            </p>
            <Button onClick={() => (window.location.href = "/")}>Browse Resources</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {favorites.map((favorite) => (
            <Card
              key={favorite.id}
              className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileIcon className="h-12 w-12 text-gray-600 dark:text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {favorite.resources.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {favorite.resources.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFavorite(favorite.resource_id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline">{favorite.resources.category}</Badge>
                      <Badge variant="secondary">{favorite.resources.file_type.toUpperCase()}</Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{favorite.resources.rating.toFixed(1)}</span>
                        <span>({favorite.resources.rating_count})</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <DownloadIcon className="h-4 w-4" />
                        <span>{favorite.resources.downloads.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/resource/${favorite.resources.id}`, "_blank")}
                      >
                        <EyeIcon className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(favorite.resources)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

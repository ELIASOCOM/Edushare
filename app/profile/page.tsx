"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  UserIcon,
  SettingsIcon,
  HeartIcon,
  DownloadIcon,
  UploadIcon,
  StarIcon,
  FileIcon,
  LoaderIcon,
} from "lucide-react"
import { getProfile, updateProfile, getUserFavorites, getUserStats, type Profile } from "@/lib/database"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [favorites, setFavorites] = useState<any[]>([])
  const [stats, setStats] = useState({ uploads: 0, favorites: 0, downloads: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    website: "",
  })

  useEffect(() => {
    if (user) {
      loadProfileData()
    }
  }, [user])

  const loadProfileData = async () => {
    if (!user) return

    try {
      setLoading(true)

      const [profileData, favoritesData, statsData] = await Promise.all([
        getProfile(user.id),
        getUserFavorites(user.id),
        getUserStats(user.id),
      ])

      setProfile(profileData)
      setFavorites(favoritesData || [])
      setStats(statsData)

      setFormData({
        username: profileData.username || "",
        full_name: profileData.full_name || "",
        bio: profileData.bio || "",
        website: profileData.website || "",
      })
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      setSaving(true)

      const updatedProfile = await updateProfile(user.id, formData)
      setProfile(updatedProfile)

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your profile</h1>
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
          <span className="ml-2 text-lg">Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Mobile-optimized Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 rounded-2xl p-4 md:p-8 shadow-lg border border-white/20 dark:border-slate-700/20 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {profile?.full_name || profile?.username || "User"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2 md:mb-4 text-sm md:text-base">{user.email}</p>
              {profile?.bio && (
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base max-w-2xl">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Mobile-optimized Stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200/50 dark:border-slate-700/50">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.uploads}</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                <UploadIcon className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Uploads</span>
                <span className="sm:hidden">Up</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-red-600">{stats.favorites}</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                <HeartIcon className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Favorites</span>
                <span className="sm:hidden">Fav</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.downloads}</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                <DownloadIcon className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Downloads</span>
                <span className="sm:hidden">DL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="favorites" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-slate-800/80">
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartIcon className="h-5 w-5 text-red-500" />
                  Your Favorites
                </CardTitle>
                <CardDescription>Resources you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No favorites yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Start exploring resources and add them to your favorites!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {favorites.map((favorite) => (
                      <div
                        key={favorite.id}
                        className="flex items-center gap-4 p-4 bg-gray-50/80 dark:bg-slate-700/80 rounded-xl hover:bg-gray-100/80 dark:hover:bg-slate-600/80 transition-colors"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-600 dark:to-slate-700 rounded-lg flex items-center justify-center">
                          <FileIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                            {favorite.resources.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {favorite.resources.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {favorite.resources.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{favorite.resources.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <DownloadIcon className="h-3 w-3" />
                              <span>{favorite.resources.downloads}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(favorite.resources.file_url, "_blank")}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium">
                      Username
                    </label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter your username"
                      className="bg-white/50 dark:bg-slate-900/50 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="full_name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="bg-white/50 dark:bg-slate-900/50 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                    rows={4}
                    className="bg-white/50 dark:bg-slate-900/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">
                    Website
                  </label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://your-website.com"
                    className="bg-white/50 dark:bg-slate-900/50 h-11"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 md:pt-6 border-t border-gray-200/50 dark:border-slate-700/50">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        username: profile?.username || "",
                        full_name: profile?.full_name || "",
                        bio: profile?.bio || "",
                        website: profile?.website || "",
                      })
                    }
                    className="w-full sm:w-auto"
                  >
                    Reset Changes
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {saving ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

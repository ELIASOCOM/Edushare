"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { UserIcon, BellIcon, ShieldIcon, PaletteIcon, DownloadIcon, TrashIcon, LoaderIcon } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [settings, setSettings] = useState({
    // Account settings
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",

    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    newResourceAlerts: true,
    communityUpdates: false,

    // Privacy settings
    profileVisibility: "public",
    showEmail: false,
    showDownloadHistory: false,
    allowDirectMessages: true,

    // Appearance settings
    theme: "system",
    language: "en",
    itemsPerPage: 12,
    defaultView: "grid",

    // Download settings
    autoDownload: false,
    downloadLocation: "default",
    downloadQuality: "high",
  })

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to access settings.</p>
          <Button onClick={() => (window.location.href = "/auth/login")}>Sign In</Button>
        </div>
      </div>
    )
  }

  const handleSave = async (section: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Settings saved",
        description: `Your ${section} settings have been updated successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account deletion requested",
        description: "Your account deletion request has been submitted. You will receive an email confirmation.",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and privacy settings</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 dark:bg-slate-800/80">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <PaletteIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Downloads</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account">
            <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account information and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="bg-white/50 dark:bg-slate-900/50"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={settings.currentPassword}
                        onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={settings.newPassword}
                        onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={settings.confirmPassword}
                        onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="destructive" onClick={handleDeleteAccount} className="flex items-center gap-2">
                    <TrashIcon className="h-4 w-4" />
                    Delete Account
                  </Button>
                  <Button onClick={() => handleSave("account")} disabled={loading}>
                    {loading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get a weekly summary of new resources</p>
                    </div>
                    <Switch
                      checked={settings.weeklyDigest}
                      onCheckedChange={(checked) => setSettings({ ...settings, weeklyDigest: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Resource Alerts</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when new resources are added in your favorite categories
                      </p>
                    </div>
                    <Switch
                      checked={settings.newResourceAlerts}
                      onCheckedChange={(checked) => setSettings({ ...settings, newResourceAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Community Updates</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive updates about community discussions and events
                      </p>
                    </div>
                    <Switch
                      checked={settings.communityUpdates}
                      onCheckedChange={(checked) => setSettings({ ...settings, communityUpdates: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => handleSave("notifications")} disabled={loading}>
                    {loading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control your privacy and data sharing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select
                      value={settings.profileVisibility}
                      onValueChange={(value) => setSettings({ ...settings, profileVisibility: value })}
                    >
                      <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                        <SelectItem value="members">
                          Members Only - Only registered users can see your profile
                        </SelectItem>
                        <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Display your email address on your public profile
                      </p>
                    </div>
                    <Switch
                      checked={settings.showEmail}
                      onCheckedChange={(checked) => setSettings({ ...settings, showEmail: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Download History</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow others to see what resources you've downloaded
                      </p>
                    </div>
                    <Switch
                      checked={settings.showDownloadHistory}
                      onCheckedChange={(checked) => setSettings({ ...settings, showDownloadHistory: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Direct Messages</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Let other users send you direct messages
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowDirectMessages}
                      onCheckedChange={(checked) => setSettings({ ...settings, allowDirectMessages: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => handleSave("privacy")} disabled={loading}>
                    {loading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize how the application looks and feels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value) => setSettings({ ...settings, theme: value })}
                    >
                      <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => setSettings({ ...settings, language: value })}
                    >
                      <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Items Per Page</Label>
                    <Select
                      value={settings.itemsPerPage.toString()}
                      onValueChange={(value) => setSettings({ ...settings, itemsPerPage: Number.parseInt(value) })}
                    >
                      <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 items</SelectItem>
                        <SelectItem value="12">12 items</SelectItem>
                        <SelectItem value="24">24 items</SelectItem>
                        <SelectItem value="48">48 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Default View</Label>
                    <Select
                      value={settings.defaultView}
                      onValueChange={(value) => setSettings({ ...settings, defaultView: value })}
                    >
                      <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid View</SelectItem>
                        <SelectItem value="list">List View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => handleSave("appearance")} disabled={loading}>
                    {loading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Download Settings */}
          <TabsContent value="downloads">
            <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Download Settings</CardTitle>
                <CardDescription>Configure your download preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Download</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically start downloads when clicking download button
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoDownload}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoDownload: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Download Location</Label>
                    <Select
                      value={settings.downloadLocation}
                      onValueChange={(value) => setSettings({ ...settings, downloadLocation: value })}
                    >
                      <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Downloads Folder</SelectItem>
                        <SelectItem value="desktop">Desktop</SelectItem>
                        <SelectItem value="documents">Documents</SelectItem>
                        <SelectItem value="custom">Custom Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Download Quality</Label>
                    <Select
                      value={settings.downloadQuality}
                      onValueChange={(value) => setSettings({ ...settings, downloadQuality: value })}
                    >
                      <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Quality (Original)</SelectItem>
                        <SelectItem value="medium">Medium Quality (Compressed)</SelectItem>
                        <SelectItem value="low">Low Quality (Fast Download)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => handleSave("downloads")} disabled={loading}>
                    {loading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
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

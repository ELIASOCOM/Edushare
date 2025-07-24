"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  FileText,
  Download,
  Heart,
  Clock,
  UserX,
  Search,
  ShieldCheck,
  Ban,
  Trash2,
  Eye,
  Star,
  Home,
  ArrowLeft,
} from "lucide-react"
import {
  isCurrentUserAdmin,
  getAdminStats,
  getAllUsersWithStats,
  getAllResourcesWithUsers,
  updateUserRole,
  toggleUserBan,
  deleteUser,
  updateResourceStatus,
  toggleResourceFeatured,
  deleteResource,
  type AdminStats,
  type UserWithStats,
  type ResourceWithUser,
} from "@/lib/admin"

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [resources, setResources] = useState<ResourceWithUser[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [resourceSearch, setResourceSearch] = useState("")
  const [resourceCategory, setResourceCategory] = useState("all")
  const [resourceStatus, setResourceStatus] = useState("all")
  const [userPage, setUserPage] = useState(1)
  const [resourcePage, setResourcePage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalResources, setTotalResources] = useState(0)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (loading) return
    loadStats()
    loadUsers()
    loadResources()
  }, [loading, userSearch, resourceSearch, resourceCategory, resourceStatus, userPage, resourcePage])

  const checkAdminAccess = async () => {
    try {
      const isAdmin = await isCurrentUserAdmin()
      if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive",
        })
        router.push("/")
        return
      }
      setLoading(false)
    } catch (error) {
      console.error("Error checking admin access:", error)
      toast({
        title: "Error",
        description: "Failed to verify admin access.",
        variant: "destructive",
      })
      router.push("/")
    }
  }

  const loadStats = async () => {
    try {
      const adminStats = await getAdminStats()
      setStats(adminStats)
    } catch (error) {
      console.error("Error loading stats:", error)
      toast({
        title: "Error",
        description: "Failed to load admin statistics",
        variant: "destructive",
      })
    }
  }

  const loadUsers = async () => {
    try {
      const { users: userData, total } = await getAllUsersWithStats(userPage, 10, userSearch)
      setUsers(userData)
      setTotalUsers(total)
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    }
  }

  const loadResources = async () => {
    try {
      const { resources: resourceData, total } = await getAllResourcesWithUsers(
        resourcePage,
        10,
        resourceSearch,
        resourceCategory,
        resourceStatus,
      )
      setResources(resourceData)
      setTotalResources(total)
    } catch (error) {
      console.error("Error loading resources:", error)
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role)
      toast({
        title: "Success",
        description: "User role updated successfully",
      })
      loadUsers()
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  const handleToggleUserBan = async (userId: string, isBanned: boolean) => {
    try {
      await toggleUserBan(userId, isBanned)
      toast({
        title: "Success",
        description: `User ${isBanned ? "banned" : "unbanned"} successfully`,
      })
      loadUsers()
      loadStats()
    } catch (error) {
      console.error("Error toggling user ban:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      loadUsers()
      loadStats()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleUpdateResourceStatus = async (resourceId: string, status: string) => {
    try {
      await updateResourceStatus(resourceId, status)
      toast({
        title: "Success",
        description: "Resource status updated successfully",
      })
      loadResources()
      loadStats()
    } catch (error) {
      console.error("Error updating resource status:", error)
      toast({
        title: "Error",
        description: "Failed to update resource status",
        variant: "destructive",
      })
    }
  }

  const handleToggleResourceFeatured = async (resourceId: string, isFeatured: boolean) => {
    try {
      await toggleResourceFeatured(resourceId, isFeatured)
      toast({
        title: "Success",
        description: `Resource ${isFeatured ? "featured" : "unfeatured"} successfully`,
      })
      loadResources()
    } catch (error) {
      console.error("Error toggling resource featured status:", error)
      toast({
        title: "Error",
        description: "Failed to update resource status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await deleteResource(resourceId)
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      })
      loadResources()
      loadStats()
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, resources, and system settings</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResources}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFavorites}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Resources</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingResources}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bannedUsers}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="resources">Resource Management</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Favorites</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || ""} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || user.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name || user.username}</div>
                          <div className="text-sm text-muted-foreground">{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role || "user"}
                          onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.is_banned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                          {user.is_banned ? "Banned" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.resource_count || 0}</TableCell>
                      <TableCell>{user.download_count || 0}</TableCell>
                      <TableCell>{user.favorite_count || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserBan(user.id, !user.is_banned)}
                          >
                            {user.is_banned ? (
                              <>
                                <ShieldCheck className="h-4 w-4 mr-1" />
                                Unban
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4 mr-1" />
                                Ban
                              </>
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this user? This action cannot be undone and will
                                  remove all their resources, favorites, and other data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {users.length} of {totalUsers} users
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserPage(Math.max(1, userPage - 1))}
                    disabled={userPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {userPage} of {Math.ceil(totalUsers / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUserPage(userPage + 1)}
                    disabled={users.length < 10}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Management</CardTitle>
              <CardDescription>Manage uploaded resources, approvals, and featured content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    value={resourceSearch}
                    onChange={(e) => setResourceSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={resourceCategory} onValueChange={setResourceCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="textbook">Textbooks</SelectItem>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="assignment">Assignments</SelectItem>
                    <SelectItem value="exam">Exams</SelectItem>
                    <SelectItem value="project">Projects</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={resourceStatus} onValueChange={setResourceStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{resource.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{resource.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {resource.uploader && (
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={resource.uploader.avatar_url || ""} />
                              <AvatarFallback>{resource.uploader.full_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{resource.uploader.full_name || resource.uploader.username}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{resource.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={resource.status}
                          onValueChange={(value) => handleUpdateResourceStatus(resource.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleResourceFeatured(resource.id, !resource.is_featured)}
                        >
                          <Star
                            className={`h-4 w-4 ${resource.is_featured ? "fill-yellow-400 text-yellow-400" : ""}`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell>{resource.download_count || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/resource/${resource.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this resource? This action cannot be undone and will
                                  remove all associated data including favorites and downloads.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteResource(resource.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {resources.length} of {totalResources} resources
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResourcePage(Math.max(1, resourcePage - 1))}
                    disabled={resourcePage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {resourcePage} of {Math.ceil(totalResources / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResourcePage(resourcePage + 1)}
                    disabled={resources.length < 10}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

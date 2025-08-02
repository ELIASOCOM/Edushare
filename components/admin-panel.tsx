"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Trash2,
  Edit,
  Users,
  FileText,
  TrendingUp,
  Shield,
  ShieldOff,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  UserX,
  RefreshCw,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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

interface PDF {
  id: string
  title: string
  description: string
  file_path: string
  file_size: number
  likes_count: number
  download_count: number
  is_approved: boolean
  created_at: string
  user_id: string
  user_email: string
}

interface User {
  id: string
  email: string
  full_name: string
  is_admin: boolean
  created_at: string
  pdf_count?: number
}

interface AdminPanelProps {
  isVisible?: boolean
}

export default function AdminPanel({ isVisible = true }: AdminPanelProps) {
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "pdfs" | "users">("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingPdf, setEditingPdf] = useState<PDF | null>(null)
  const [editForm, setEditForm] = useState({ title: "", description: "" })
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log("Admin panel: Fetching ALL PDFs...")

      // Force admin context by using a direct query
      // This bypasses any potential RLS issues
      const { data: pdfData, error: pdfError } = await supabase
        .from("pdfs")
        .select("*")
        .order("created_at", { ascending: false })

      console.log("Admin panel PDF fetch result:", { pdfData, pdfError, count: pdfData?.length })

      if (pdfError) {
        console.error("PDF fetch error:", pdfError)
        throw pdfError
      }

      // Get user profiles for ALL users who have uploaded PDFs
      const userIds = [...new Set(pdfData?.map((pdf) => pdf.user_id) || [])]
      console.log("Fetching profiles for user IDs:", userIds)

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds)

      if (profileError) {
        console.error("Profile fetch error:", profileError)
      }

      // Combine PDF data with user emails
      const pdfsWithUsers =
        pdfData?.map((pdf) => {
          const profile = profileData?.find((p) => p.id === pdf.user_id)
          return {
            ...pdf,
            user_email: profile?.email || "Unknown User",
          }
        }) || []

      console.log("Admin panel: Final PDF data with users:", pdfsWithUsers.length, "PDFs")
      setPdfs(pdfsWithUsers)

      // Fetch ALL users with PDF counts
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (userError) throw userError

      // Add PDF counts to users
      const usersWithCounts =
        userData?.map((user) => ({
          ...user,
          pdf_count: pdfsWithUsers.filter((pdf) => pdf.user_id === user.id).length,
        })) || []

      setUsers(usersWithCounts)
    } catch (error: any) {
      console.error("Admin fetch error:", error)
      toast({
        title: "Error",
        description: `Failed to fetch admin data: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    toast({
      title: "Refreshed",
      description: "Admin data has been refreshed",
    })
  }

  const togglePdfApproval = async (pdfId: string, currentStatus: boolean) => {
    try {
      console.log(`Admin: Toggling approval for PDF ${pdfId} from ${currentStatus} to ${!currentStatus}`)

      const { error } = await supabase.from("pdfs").update({ is_approved: !currentStatus }).eq("id", pdfId)

      if (error) {
        console.error("Approval toggle error:", error)
        throw error
      }

      toast({
        title: "Success",
        description: `PDF ${!currentStatus ? "approved" : "hidden"}`,
      })

      // Update local state immediately
      setPdfs((prevPdfs) => prevPdfs.map((pdf) => (pdf.id === pdfId ? { ...pdf, is_approved: !currentStatus } : pdf)))
    } catch (error: any) {
      console.error("Toggle approval error:", error)
      toast({
        title: "Error",
        description: `Failed to update PDF status: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const deletePdf = async (pdf: PDF) => {
    try {
      console.log(`Admin: Deleting PDF ${pdf.id} by ${pdf.user_email}`)

      // Delete from storage first
      const { error: storageError } = await supabase.storage.from("edu-resources").remove([pdf.file_path])

      if (storageError) {
        console.error("Storage delete error:", storageError)
        // Continue anyway - the file might not exist in storage
      }

      // Delete from database
      const { error: dbError } = await supabase.from("pdfs").delete().eq("id", pdf.id)

      if (dbError) {
        console.error("Database delete error:", dbError)
        throw dbError
      }

      toast({
        title: "Success",
        description: `PDF "${pdf.title}" deleted successfully`,
      })

      // Update local state
      setPdfs((prevPdfs) => prevPdfs.filter((p) => p.id !== pdf.id))
    } catch (error: any) {
      console.error("Delete PDF error:", error)
      toast({
        title: "Error",
        description: `Failed to delete PDF: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const updatePdf = async () => {
    if (!editingPdf) return

    try {
      const { error } = await supabase
        .from("pdfs")
        .update({
          title: editForm.title,
          description: editForm.description,
        })
        .eq("id", editingPdf.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "PDF updated successfully",
      })
      setEditingPdf(null)

      // Update local state
      setPdfs((prevPdfs) =>
        prevPdfs.map((pdf) =>
          pdf.id === editingPdf.id ? { ...pdf, title: editForm.title, description: editForm.description } : pdf,
        ),
      )
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update PDF: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const toggleUserAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("profiles").update({ is_admin: !currentStatus }).eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: `User ${!currentStatus ? "promoted to" : "removed from"} admin`,
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  const deleteUser = async (userId: string, userEmail: string) => {
    try {
      // First delete user's PDFs and their files
      const userPdfs = pdfs.filter((pdf) => pdf.user_id === userId)

      for (const pdf of userPdfs) {
        // Delete from storage
        await supabase.storage.from("edu-resources").remove([pdf.file_path])
        // Delete from database
        await supabase.from("pdfs").delete().eq("id", pdf.id)
      }

      // Delete user profile
      const { error } = await supabase.from("profiles").delete().eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: `User ${userEmail} and all their content deleted`,
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredPdfs = pdfs.filter(
    (pdf) =>
      pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf.user_email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const stats = {
    totalPdfs: pdfs.length,
    approvedPdfs: pdfs.filter((pdf) => pdf.is_approved).length,
    pendingPdfs: pdfs.filter((pdf) => !pdf.is_approved).length,
    totalUsers: users.length,
    adminUsers: users.filter((user) => user.is_admin).length,
    totalDownloads: pdfs.reduce((sum, pdf) => sum + pdf.download_count, 0),
    totalLikes: pdfs.reduce((sum, pdf) => sum + pdf.likes_count, 0),
    totalStorage: pdfs.reduce((sum, pdf) => sum + pdf.file_size, 0),
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.location.reload()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="border-l border-slate-300 pl-4">
                <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>
                <p className="text-sm text-slate-600">Manage users, PDFs, and platform settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={refreshData} disabled={refreshing} size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                <Shield className="w-3 h-3 mr-1" />
                Administrator
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="pdfs" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>PDFs ({pdfs.length})</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users ({users.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total PDFs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalPdfs}</div>
                  <p className="text-xs text-slate-500">
                    {stats.approvedPdfs} approved, {stats.pendingPdfs} pending
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
                  <p className="text-xs text-slate-500">{stats.adminUsers} administrators</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Downloads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalDownloads}</div>
                  <p className="text-xs text-slate-500">{stats.totalLikes} total likes</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Storage Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{formatFileSize(stats.totalStorage)}</div>
                  <p className="text-xs text-slate-500">Across all files</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle>Recent PDFs</CardTitle>
                <CardDescription>Latest uploads to the platform (showing all files)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pdfs.slice(0, 5).map((pdf) => (
                    <div key={pdf.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">{pdf.title}</h4>
                        <p className="text-sm text-slate-600">
                          By {pdf.user_email} • {formatDate(pdf.created_at)}
                        </p>
                      </div>
                      <Badge variant={pdf.is_approved ? "default" : "secondary"}>
                        {pdf.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PDFs Tab */}
          <TabsContent value="pdfs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search PDFs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300"
                />
              </div>
              <div className="flex items-center space-x-3">
                {stats.pendingPdfs > 0 && <Badge variant="destructive">{stats.pendingPdfs} pending approval</Badge>}
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Showing all {stats.totalPdfs} files
                </Badge>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p>Loading admin data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPdfs.map((pdf) => (
                  <Card
                    key={pdf.id}
                    className={`border-slate-200 bg-white/80 backdrop-blur-sm ${!pdf.is_approved ? "border-orange-200 bg-orange-50/50" : ""}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{pdf.title}</h3>
                            <Badge variant={pdf.is_approved ? "default" : "secondary"}>
                              {pdf.is_approved ? "Approved" : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-slate-600 mb-3 line-clamp-2">
                            {pdf.description || "No description provided"}
                          </p>
                          <div className="flex items-center space-x-6 text-sm text-slate-500">
                            <span>By {pdf.user_email}</span>
                            <span>{formatDate(pdf.created_at)}</span>
                            <span>{formatFileSize(pdf.file_size)}</span>
                            <span>{pdf.likes_count} likes</span>
                            <span>{pdf.download_count} downloads</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingPdf(pdf)
                                  setEditForm({ title: pdf.title, description: pdf.description || "" })
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => togglePdfApproval(pdf.id, pdf.is_approved)}>
                                {pdf.is_approved ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Approve
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deletePdf(pdf)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300"
              />
            </div>

            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border-gray-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">{user.email.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{user.full_name || user.email}</h3>
                          <p className="text-slate-600">{user.email}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                            <span>Joined {formatDate(user.created_at)}</span>
                            <span>{user.pdf_count} PDFs uploaded</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={user.is_admin ? "default" : "secondary"}>
                          {user.is_admin ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            "User"
                          )}
                        </Badge>
                        {user.email !== "ocomelias8@gmail.com" && (
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => toggleUserAdmin(user.id, user.is_admin)}>
                              {user.is_admin ? (
                                <>
                                  <ShieldOff className="w-4 h-4 mr-1" />
                                  Remove Admin
                                </>
                              ) : (
                                <>
                                  <Shield className="w-4 h-4 mr-1" />
                                  Make Admin
                                </>
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <UserX className="w-4 h-4 mr-1" />
                                  Delete User
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete {user.email} and all their uploaded PDFs. This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUser(user.id, user.email)}
                                    className="bg-red-600 hover:bg-red-red-700"
                                  >
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit PDF Dialog */}
      <Dialog open={!!editingPdf} onOpenChange={() => setEditingPdf(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit PDF</DialogTitle>
            <DialogDescription>Update the title and description for this PDF</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditingPdf(null)}>
              Cancel
            </Button>
            <Button onClick={updatePdf}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

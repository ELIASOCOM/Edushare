"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Upload,
  Download,
  Heart,
  Search,
  LogOut,
  FileText,
  User,
  Settings,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Share2,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import UploadDialog from "./upload-dialog"
import PDFViewer from "./pdf-viewer"
import AdminPanel from "./admin-panel"
import UploadDebug from "./upload-debug"
import Footer from "./footer"
import AdminDebug from "./admin-debug"
import MobileNav from "./mobile-nav"
import SocialShare from "./social-share"

interface PDF {
  id: string
  title: string
  description: string
  file_path: string
  file_size: number
  likes_count: number
  download_count: number
  share_count: number
  view_count: number
  is_approved: boolean
  created_at: string
  user_id: string
  user_email: string
  user_liked: boolean
}

const ITEMS_PER_PAGE = 12

export default function Dashboard() {
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPdf, setSelectedPdf] = useState<PDF | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "downloads">("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    fetchPDFs()
  }, [currentPage, sortBy, searchTerm])

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      let { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

      if (!profile) {
        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          is_admin: user.email === "ocomelias8@gmail.com",
        })

        if (!error) {
          const { data: newProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
          profile = newProfile
        }
      }

      const adminStatus = profile?.is_admin || false
      console.log("User admin status:", adminStatus, "for email:", user.email)
      setIsAdmin(adminStatus)
    }
  }

  const fetchPDFs = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Get user profile to check admin status
      let isUserAdmin = false
      if (user) {
        const { data: userProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
        isUserAdmin = userProfile?.is_admin === true
      }

      // Build base query - include new columns
      let query = supabase.from("pdfs").select("*, share_count, view_count", { count: "exact" })

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      // IMPORTANT: Admins see ALL files (approved and pending), regular users see only approved
      if (!isUserAdmin) {
        query = query.eq("is_approved", true)
      }
      // If admin, don't add any approval filter - they see everything

      // Apply sorting
      switch (sortBy) {
        case "popular":
          query = query.order("likes_count", { ascending: false })
          break
        case "downloads":
          query = query.order("download_count", { ascending: false })
          break
        case "newest":
        default:
          query = query.order("created_at", { ascending: false })
          break
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data: pdfData, error: pdfError, count } = await query

      if (pdfError) {
        console.error("Fetch PDFs error:", pdfError)
        throw pdfError
      }

      setTotalCount(count || 0)

      if (!pdfData || pdfData.length === 0) {
        setPdfs([])
        setLoading(false)
        return
      }

      const userIds = [...new Set(pdfData.map((pdf) => pdf.user_id))]

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds)

      if (profileError) {
        console.error("Fetch profiles error:", profileError)
      }

      let userLikes: string[] = []
      if (user) {
        const { data: likesData, error: likesError } = await supabase
          .from("pdf_likes")
          .select("pdf_id")
          .eq("user_id", user.id)

        if (!likesError && likesData) {
          userLikes = likesData.map((like) => like.pdf_id)
        }
      }

      const pdfsWithUserInfo = pdfData.map((pdf) => {
        const profile = profileData?.find((p) => p.id === pdf.user_id)
        return {
          ...pdf,
          user_email: profile?.email || "Unknown User",
          user_liked: userLikes.includes(pdf.id),
          share_count: pdf.share_count || 0,
          view_count: pdf.view_count || 0,
        }
      })

      setPdfs(pdfsWithUserInfo)
    } catch (error: any) {
      console.error("Fetch PDFs error:", error)
      toast({
        title: "Error",
        description: "Failed to fetch PDFs. Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (pdfId: string, currentlyLiked: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    try {
      if (currentlyLiked) {
        await supabase.from("pdf_likes").delete().eq("pdf_id", pdfId).eq("user_id", user.id)
      } else {
        await supabase.from("pdf_likes").insert({ pdf_id: pdfId, user_id: user.id })
      }

      setPdfs((prevPdfs) =>
        prevPdfs.map((pdf) =>
          pdf.id === pdfId
            ? {
                ...pdf,
                user_liked: !currentlyLiked,
                likes_count: currentlyLiked ? pdf.likes_count - 1 : pdf.likes_count + 1,
              }
            : pdf,
        ),
      )
    } catch (error) {
      console.error("Like error:", error)
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (pdf: PDF) => {
    try {
      let downloadData = null
      let downloadError = null

      const { data, error } = await supabase.storage.from("edu-resources").download(pdf.file_path)

      if (error || !data) {
        const alternativePaths = [pdf.file_path.replace(/^\/+/, ""), `${pdf.user_id}/${pdf.file_path.split("/").pop()}`]

        for (const altPath of alternativePaths) {
          console.log("Trying alternative download path:", altPath)
          const { data: altData, error: altError } = await supabase.storage.from("edu-resources").download(altPath)

          if (!altError && altData) {
            downloadData = altData
            console.log("Download successful with alternative path:", altPath)
            break
          }
          downloadError = altError
        }

        if (!downloadData) {
          throw downloadError || error || new Error("Failed to download file")
        }
      } else {
        downloadData = data
      }

      await supabase.rpc("increment_download_count", { pdf_id: pdf.id })

      const url = URL.createObjectURL(downloadData)
      const a = document.createElement("a")
      a.href = url
      a.download = pdf.title + ".pdf"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setPdfs((prevPdfs) => prevPdfs.map((p) => (p.id === pdf.id ? { ...p, download_count: p.download_count + 1 } : p)))

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      })
    } catch (error: any) {
      console.error("Download error:", error)
      toast({
        title: "Error",
        description: `Failed to download PDF: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleSortChange = (newSort: "newest" | "popular" | "downloads") => {
    setSortBy(newSort)
    setCurrentPage(1) // Reset to first page when sorting changes
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

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
    })
  }

  if (showAdminPanel && isAdmin) {
    return <AdminPanel isVisible={true} />
  }

  if (selectedPdf) {
    return <PDFViewer pdf={selectedPdf} onBack={() => setSelectedPdf(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-purple-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 lg:space-x-6">
              <div className="md:hidden">
                <MobileNav
                  user={user}
                  isAdmin={isAdmin}
                  onUpload={() => setShowUpload(true)}
                  onAdminPanel={() => setShowAdminPanel(true)}
                  onSignOut={handleSignOut}
                  pdfCount={totalCount}
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    EduResources
                  </h1>
                  <p className="text-xs text-slate-500 -mt-1 hidden sm:block">Educational Excellence Platform</p>
                </div>
              </div>

              <Badge
                variant="secondary"
                className="hidden lg:inline-flex bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 border-purple-200"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {totalCount} Resources
              </Badge>
            </div>

            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              <div className="flex items-center space-x-2 text-sm text-slate-600 bg-gradient-to-r from-slate-50 to-purple-50 px-3 py-2 rounded-full border border-purple-200/50">
                <User className="w-4 h-4 text-purple-500" />
                <span className="font-medium max-w-32 lg:max-w-none truncate">{user?.email}</span>
                {isAdmin && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 text-xs ml-2"
                  >
                    Admin
                  </Badge>
                )}
              </div>

              <Button
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>

              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setShowAdminPanel(true)}
                  className="border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 shadow-sm hover:shadow-purple-500/25 transition-all duration-300"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            <div className="md:hidden">
              <Button
                onClick={() => setShowUpload(true)}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg"
              >
                <Upload className="w-4 h-4 mr-1" />
                <span className="text-xs">Upload</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Search and Filters */}
        <div className="mb-6 md:mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
              <Input
                placeholder="Search resources, authors..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-36 md:w-40 border-purple-300 bg-white/80 backdrop-blur-sm">
                  <Filter className="w-4 h-4 mr-2 text-purple-500" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-pink-500" />
                      Most Liked
                    </div>
                  </SelectItem>
                  <SelectItem value="downloads">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                      Most Downloaded
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border border-purple-300 rounded-lg p-1 bg-white/80 backdrop-blur-sm">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              Showing {pdfs.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} resources
              {searchTerm && <span className="ml-2 font-medium">for "{searchTerm}"</span>}
            </div>
            {isAdmin && (
              <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700">
                Admin View: All Files
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" : "space-y-4"
            }
          >
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border-purple-200 bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded mb-2"></div>
                  <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pdfs.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">No resources found</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto px-4">
              {searchTerm
                ? "Try adjusting your search terms or filters"
                : "Be the first to share an educational resource with the community!"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload First Resource
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* PDF Grid/List */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {pdfs.map((pdf) => (
                  <Card
                    key={pdf.id}
                    className={`hover:shadow-xl transition-all duration-300 border-purple-200 hover:border-purple-300 cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white/90 ${
                      !pdf.is_approved ? "border-orange-300 bg-gradient-to-br from-orange-50/80 to-yellow-50/80" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-base md:text-lg line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all flex-1">
                          {pdf.title}
                        </CardTitle>
                        {!pdf.is_approved && (
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 text-xs ml-2"
                          >
                            Pending
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 text-slate-600 text-sm">
                        {pdf.description || "No description provided"}
                      </CardDescription>
                      <div className="flex items-center justify-between text-xs md:text-sm text-slate-500 pt-2">
                        <span className="font-medium truncate max-w-24 md:max-w-none">{pdf.user_email}</span>
                        <span className="hidden sm:inline">{formatDate(pdf.created_at)}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3 md:space-x-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Heart
                              className={`w-4 h-4 ${pdf.user_liked ? "fill-current text-pink-500" : "text-slate-400"}`}
                            />
                            <span>{pdf.likes_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Download className="w-4 h-4 text-slate-400" />
                            <span>{pdf.download_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share2 className="w-4 h-4 text-slate-400" />
                            <span>{pdf.share_count}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-slate-100 to-purple-100 text-slate-700 text-xs"
                          >
                            {formatFileSize(pdf.file_size)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 md:space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(pdf.id, pdf.user_liked)
                            }}
                            className={`hover:bg-pink-50 p-1 md:p-2 ${pdf.user_liked ? "text-pink-500" : "text-slate-600"}`}
                          >
                            <Heart className={`w-4 h-4 ${pdf.user_liked ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownload(pdf)
                            }}
                            className="hover:bg-blue-50 text-slate-600 p-1 md:p-2"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <SocialShare pdf={pdf} className="p-1 md:p-2" />
                        </div>
                        <Button
                          onClick={() => setSelectedPdf(pdf)}
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-xs md:text-sm"
                        >
                          View PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {pdfs.map((pdf) => (
                  <Card
                    key={pdf.id}
                    className={`hover:shadow-lg transition-shadow border-purple-200 bg-white/80 backdrop-blur-sm ${
                      !pdf.is_approved ? "border-orange-300 bg-gradient-to-r from-orange-50/80 to-yellow-50/80" : ""
                    }`}
                  >
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-base md:text-lg font-semibold text-slate-900 line-clamp-1 flex-1">
                              {pdf.title}
                            </h3>
                            {!pdf.is_approved && (
                              <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 text-xs ml-2"
                              >
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-600 mb-3 line-clamp-2 text-sm md:text-base">
                            {pdf.description || "No description provided"}
                          </p>
                          <div className="flex items-center space-x-4 md:space-x-6 text-xs md:text-sm text-slate-500">
                            <span className="font-medium truncate max-w-32 md:max-w-none">{pdf.user_email}</span>
                            <span className="hidden sm:inline">{formatDate(pdf.created_at)}</span>
                            <Badge
                              variant="secondary"
                              className="bg-gradient-to-r from-slate-100 to-purple-100 text-slate-700 text-xs"
                            >
                              {formatFileSize(pdf.file_size)}
                            </Badge>
                            <div className="flex items-center space-x-3 md:space-x-4">
                              <div className="flex items-center space-x-1">
                                <Heart
                                  className={`w-4 h-4 ${pdf.user_liked ? "fill-current text-pink-500" : "text-slate-400"}`}
                                />
                                <span>{pdf.likes_count}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Download className="w-4 h-4 text-slate-400" />
                                <span>{pdf.download_count}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Share2 className="w-4 h-4 text-slate-400" />
                                <span>{pdf.share_count}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(pdf.id, pdf.user_liked)}
                            className={`hover:bg-pink-50 ${pdf.user_liked ? "text-pink-500" : "text-slate-600"}`}
                          >
                            <Heart className={`w-4 h-4 ${pdf.user_liked ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(pdf)}
                            className="hover:bg-blue-50 text-slate-600"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <SocialShare pdf={pdf} />
                          <Button
                            onClick={() => setSelectedPdf(pdf)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          >
                            View PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {/* Show first page */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant={1 === currentPage ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        className="w-8 h-8 p-0"
                      >
                        1
                      </Button>
                      {currentPage > 4 && <span className="text-slate-400">...</span>}
                    </>
                  )}

                  {/* Show pages around current page */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                    if (pageNum > totalPages) return null
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}

                  {/* Show last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="text-slate-400">...</span>}
                      <Button
                        variant={totalPages === currentPage ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <UploadDialog open={showUpload} onOpenChange={setShowUpload} onUploadSuccess={fetchPDFs} />
      <UploadDebug />
      <Footer />
      <AdminDebug />
    </div>
  )
}

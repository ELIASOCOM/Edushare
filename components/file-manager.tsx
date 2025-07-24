"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  FileIcon,
  FileTextIcon,
  FileImageIcon,
  FileVideoIcon,
  FileIcon as FilePdfIcon,
  FileArchiveIcon,
  FileAudioIcon,
  SearchIcon,
  DownloadIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  GridIcon,
  ListIcon,
  TrendingUpIcon,
  ClockIcon,
  StarIcon,
  LoaderIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import {
  getResources,
  addToFavorites,
  removeFromFavorites,
  checkFavorites,
  trackDownload,
  rateResource,
  getUserRatings,
  type Resource,
  type PaginationResult,
} from "@/lib/database"

const getFileIcon = (type: string, className = "h-8 w-8") => {
  const iconClass = cn(className)
  switch (type) {
    case "pdf":
      return <FilePdfIcon className={cn(iconClass, "text-red-500")} />
    case "image":
      return <FileImageIcon className={cn(iconClass, "text-blue-500")} />
    case "video":
      return <FileVideoIcon className={cn(iconClass, "text-purple-500")} />
    case "audio":
      return <FileAudioIcon className={cn(iconClass, "text-green-500")} />
    case "archive":
      return <FileArchiveIcon className={cn(iconClass, "text-yellow-500")} />
    case "document":
    case "presentation":
      return <FileTextIcon className={cn(iconClass, "text-orange-500")} />
    default:
      return <FileIcon className={cn(iconClass, "text-gray-500")} />
  }
}

const categories = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Literature",
  "Computer Science",
  "Art",
  "Geography",
  "Music",
]

export function FileManager() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()

  // URL state management
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all")
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams.get("page") || "1"))

  // Data state
  const [paginationResult, setPaginationResult] = useState<PaginationResult<Resource>>({
    data: [],
    count: 0,
    hasMore: false,
    page: 1,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<Resource | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [userRatings, setUserRatings] = useState<Map<string, number>>(new Map())

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearchQuery) params.set("q", debouncedSearchQuery)
    if (categoryFilter !== "all") params.set("category", categoryFilter)
    if (typeFilter !== "all") params.set("type", typeFilter)
    if (sortBy !== "recent") params.set("sort", sortBy)
    if (currentPage > 1) params.set("page", currentPage.toString())

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`
    window.history.replaceState({}, "", newUrl)
  }, [debouncedSearchQuery, categoryFilter, typeFilter, sortBy, currentPage])

  // Load resources
  const loadResources = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getResources({
        category: categoryFilter,
        type: typeFilter,
        search: debouncedSearchQuery,
        sortBy,
        page: currentPage,
        limit: 12,
      })
      setPaginationResult(result)
    } catch (error) {
      console.error("Error loading resources:", error)
      toast({
        title: "Error",
        description: "Failed to load resources. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, typeFilter, debouncedSearchQuery, sortBy, currentPage, toast])

  // Load user data (favorites and ratings)
  const loadUserData = useCallback(async () => {
    if (!user || paginationResult.data.length === 0) return

    try {
      const resourceIds = paginationResult.data.map((resource) => resource.id)
      const [favoritesSet, ratingsMap] = await Promise.all([
        checkFavorites(resourceIds, user.id),
        getUserRatings(resourceIds, user.id),
      ])

      setFavorites(favoritesSet)
      setUserRatings(ratingsMap)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }, [user, paginationResult.data])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  // Memoized pagination info
  const paginationInfo = useMemo(() => {
    const startItem = (currentPage - 1) * 12 + 1
    const endItem = Math.min(currentPage * 12, paginationResult.count)
    return { startItem, endItem }
  }, [currentPage, paginationResult.count])

  const handlePreview = (file: Resource) => {
    setSelectedFile(file)
  }

  const handleDownload = async (file: Resource) => {
    try {
      await trackDownload(file.id)
      toast({
        title: "Download Started",
        description: `Downloading ${file.name}`,
      })

      // Simulate download
      const link = document.createElement("a")
      link.href = file.file_url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleFavorite = async (resourceId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add favorites.",
        variant: "destructive",
      })
      return
    }

    try {
      const isFav = favorites.has(resourceId)

      if (isFav) {
        await removeFromFavorites(resourceId)
        setFavorites((prev) => {
          const newSet = new Set(prev)
          newSet.delete(resourceId)
          return newSet
        })
        toast({
          title: "Removed from favorites",
          description: "Resource removed from your favorites.",
        })
      } else {
        await addToFavorites(resourceId)
        setFavorites((prev) => new Set(prev).add(resourceId))
        toast({
          title: "Added to favorites",
          description: "Resource added to your favorites.",
        })
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRating = async (resourceId: string, rating: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to rate resources.",
        variant: "destructive",
      })
      return
    }

    try {
      await rateResource(resourceId, rating)
      setUserRatings((prev) => new Map(prev).set(resourceId, rating))
      toast({
        title: "Rating submitted",
        description: `You rated this resource ${rating} stars.`,
      })

      // Refresh resources to update average rating
      loadResources()
    } catch (error) {
      console.error("Error rating resource:", error)
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1) // Reset to first page when filters change
    switch (filterType) {
      case "category":
        setCategoryFilter(value)
        break
      case "type":
        setTypeFilter(value)
        break
      case "sort":
        setSortBy(value)
        break
    }
  }

  if (loading && paginationResult.data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoaderIcon className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading resources...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced mobile-responsive search and filter controls */}
      <div className="bg-white/70 backdrop-blur-sm dark:bg-slate-800/70 rounded-2xl p-4 md:p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Search bar */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search for educational resources..."
              className="pl-12 h-12 md:h-12 text-base md:text-lg bg-white/80 dark:bg-slate-900/80 border-0 shadow-sm focus:shadow-md transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters grid - responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            <Select value={categoryFilter} onValueChange={(value) => handleFilterChange("category", value)}>
              <SelectTrigger className="h-11 bg-white/80 dark:bg-slate-900/80 border-0 shadow-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger className="h-11 bg-white/80 dark:bg-slate-900/80 border-0 shadow-sm">
                <SelectValue placeholder="File Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => handleFilterChange("sort", value)}>
              <SelectTrigger className="h-11 bg-white/80 dark:bg-slate-900/80 border-0 shadow-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            {/* View mode toggle */}
            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2 flex justify-end">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
                <TabsList className="bg-white/80 dark:bg-slate-900/80 h-11">
                  <TabsTrigger
                    value="grid"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4"
                  >
                    <GridIcon className="h-4 w-4 mr-2 sm:mr-0" />
                    <span className="sm:hidden">Grid</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    className="data-[state=active]:bg-blue-500 data-[state=active]:text-white px-4"
                  >
                    <ListIcon className="h-4 w-4 mr-2 sm:mr-0" />
                    <span className="sm:hidden">List</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Results summary and pagination info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-blue-600">{paginationInfo.startItem}</span>-
          <span className="font-semibold text-blue-600">{paginationInfo.endItem}</span> of{" "}
          <span className="font-semibold text-blue-600">{paginationResult.count}</span> resources
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <TrendingUpIcon className="h-4 w-4" />
            <span>Trending</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            <span>Recently Added</span>
          </div>
        </div>
      </div>

      {/* Loading overlay for pagination */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
            <LoaderIcon className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Enhanced mobile-responsive grid view */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {paginationResult.data.map((resource) => (
              <Card
                key={resource.id}
                className="group overflow-hidden bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800">
                  <img
                    src={resource.file_url || "/placeholder.svg"}
                    alt={resource.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Mobile-optimized overlay badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    <Badge className="bg-white/90 text-gray-800 shadow-sm text-xs px-2 py-1">
                      {resource.file_type.toUpperCase()}
                    </Badge>
                    {resource.is_featured && (
                      <Badge className="bg-orange-500 text-white shadow-sm flex items-center gap-1 text-xs px-2 py-1">
                        <TrendingUpIcon className="h-2.5 w-2.5" />
                        <span className="hidden sm:inline">FEATURED</span>
                      </Badge>
                    )}
                  </div>

                  {/* Mobile-optimized favorite button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-sm w-8 h-8"
                    onClick={() => toggleFavorite(resource.id)}
                  >
                    <HeartIcon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        favorites.has(resource.id) ? "fill-red-500 text-red-500" : "text-gray-600",
                      )}
                    />
                  </Button>

                  {/* Mobile-optimized quick action overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePreview(resource)}
                      className="bg-white/90 hover:bg-white text-xs px-3 py-2"
                    >
                      <EyeIcon className="mr-1 h-3 w-3" />
                      <span className="hidden sm:inline">Preview</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(resource)}
                      className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-2"
                    >
                      <DownloadIcon className="mr-1 h-3 w-3" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {getFileIcon(resource.file_type, "h-5 w-5 sm:h-6 sm:w-6")}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                        {resource.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {resource.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>
                      {resource.file_size ? `${(resource.file_size / 1024 / 1024).toFixed(1)} MB` : "Unknown"}
                    </span>
                    <span className="hidden sm:inline">{new Date(resource.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs truncate max-w-[100px]">
                      {resource.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{resource.rating.toFixed(1)}</span>
                        <span className="hidden sm:inline">({resource.rating_count})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DownloadIcon className="h-3 w-3" />
                        <span>
                          {resource.downloads > 999 ? `${(resource.downloads / 1000).toFixed(1)}k` : resource.downloads}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(resource)}
                    className="flex-1 text-xs"
                  >
                    <EyeIcon className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <ShareIcon className="h-3 w-3" />
                  </Button>
                  <Button size="sm" onClick={() => handleDownload(resource)} className="flex-1 text-xs">
                    <DownloadIcon className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Enhanced list view */}
        {viewMode === "list" && (
          <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 rounded-2xl shadow-lg border-0 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50/80 dark:bg-slate-700/80 p-4 font-medium text-sm">
              <div className="col-span-5">Resource</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-1">Size</div>
              <div className="col-span-1">Rating</div>
              <div className="col-span-1">Downloads</div>
              <div className="col-span-2">Actions</div>
            </div>
            {paginationResult.data.map((resource, index) => (
              <div
                key={resource.id}
                className={cn(
                  "grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors",
                  index !== paginationResult.data.length - 1 && "border-b border-gray-200/50 dark:border-slate-600/50",
                )}
              >
                <div className="md:col-span-5 flex items-center gap-3">
                  <div className="relative">
                    {getFileIcon(resource.file_type, "h-8 w-8")}
                    {resource.is_featured && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      {resource.name}
                      {resource.is_featured && <TrendingUpIcon className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{resource.description}</div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Badge variant="outline" className="text-xs">
                    {resource.category}
                  </Badge>
                </div>
                <div className="md:col-span-1 text-sm text-gray-600 dark:text-gray-400">
                  {resource.file_size ? `${(resource.file_size / 1024 / 1024).toFixed(1)} MB` : "Unknown"}
                </div>
                <div className="md:col-span-1 flex items-center gap-1 text-sm">
                  <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{resource.rating.toFixed(1)}</span>
                </div>
                <div className="md:col-span-1 text-sm text-gray-600 dark:text-gray-400">
                  {resource.downloads.toLocaleString()}
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleFavorite(resource.id)}>
                    <HeartIcon
                      className={cn(
                        "h-4 w-4",
                        favorites.has(resource.id) ? "fill-red-500 text-red-500" : "text-gray-400",
                      )}
                    />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handlePreview(resource)}>
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(resource)}>
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginationResult.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70 rounded-2xl p-4 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {paginationResult.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-white/80 dark:bg-slate-900/80"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>

            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, paginationResult.totalPages) }, (_, i) => {
                let pageNum: number
                if (paginationResult.totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= paginationResult.totalPages - 2) {
                  pageNum = paginationResult.totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "w-10 h-10",
                      currentPage === pageNum ? "bg-blue-600 text-white" : "bg-white/80 dark:bg-slate-900/80",
                    )}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationResult.totalPages}
              className="bg-white/80 dark:bg-slate-900/80"
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced empty state */}
      {paginationResult.data.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mb-4">
            <FileIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No resources found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            We couldn't find any resources matching your criteria. Try adjusting your search or filters to discover more
            content.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setCategoryFilter("all")
              setTypeFilter("all")
              setCurrentPage(1)
            }}
            className="bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
          >
            Clear all filters
          </Button>
        </div>
      )}

      {/* Enhanced preview dialog */}
      {selectedFile && (
        <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-md dark:bg-slate-900/95">
            <DialogHeader className="pb-4 border-b border-gray-200/50 dark:border-slate-700/50">
              <DialogTitle className="flex items-center gap-3 text-xl">
                {getFileIcon(selectedFile.file_type, "h-6 w-6")}
                <div>
                  <div className="flex items-center gap-2">
                    {selectedFile.name}
                    {selectedFile.is_featured && <TrendingUpIcon className="h-5 w-5 text-orange-500" />}
                  </div>
                  <div className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                    {selectedFile.category} •{" "}
                    {selectedFile.file_size
                      ? `${(selectedFile.file_size / 1024 / 1024).toFixed(1)} MB`
                      : "Unknown size"}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {/* Preview area */}
              <div className="aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 shadow-inner">
                {selectedFile.file_type === "image" ? (
                  <img
                    src={selectedFile.file_url || "/placeholder.svg"}
                    alt={selectedFile.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    {getFileIcon(selectedFile.file_type, "h-16 w-16")}
                    <div className="ml-4 text-center">
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        {selectedFile.file_type.toUpperCase()} Preview
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Full preview available after download</p>
                    </div>
                  </div>
                )}
              </div>

              {/* File details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50/80 dark:bg-slate-800/80 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{selectedFile.rating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                    <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    Rating ({selectedFile.rating_count})
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50/80 dark:bg-slate-800/80 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{selectedFile.downloads.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
                </div>
                <div className="text-center p-4 bg-gray-50/80 dark:bg-slate-800/80 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedFile.file_size ? `${(selectedFile.file_size / 1024 / 1024).toFixed(1)} MB` : "Unknown"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">File Size</div>
                </div>
                <div className="text-center p-4 bg-gray-50/80 dark:bg-slate-800/80 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{selectedFile.file_type.toUpperCase()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">File Type</div>
                </div>
              </div>

              {/* Rating system */}
              {user && (
                <div className="p-6 bg-gray-50/80 dark:bg-slate-800/80 rounded-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Rate this resource</h4>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(selectedFile.id, star)}
                        className="transition-colors hover:scale-110"
                      >
                        <StarIcon
                          className={cn(
                            "h-6 w-6",
                            (userRatings.get(selectedFile.id) || 0) >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-400",
                          )}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      {userRatings.get(selectedFile.id)
                        ? `You rated ${userRatings.get(selectedFile.id)} stars`
                        : "Click to rate"}
                    </span>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="p-6 bg-gray-50/80 dark:bg-slate-800/80 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedFile.description}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => toggleFavorite(selectedFile.id)}>
                    <HeartIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        favorites.has(selectedFile.id) ? "fill-red-500 text-red-500" : "text-gray-600",
                      )}
                    />
                    {favorites.has(selectedFile.id) ? "Remove from Favorites" : "Add to Favorites"}
                  </Button>
                  <Button variant="outline">
                    <ShareIcon className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
                <Button
                  onClick={() => handleDownload(selectedFile)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Download Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

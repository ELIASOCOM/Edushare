"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { SearchIcon, FilterIcon, XIcon, StarIcon, DownloadIcon, EyeIcon, HeartIcon, LoaderIcon } from "lucide-react"
import { searchResources, type Resource } from "@/lib/database"
import { useAuth } from "@/contexts/auth-context"

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
  "Psychology",
  "Languages",
  "Philosophy",
  "Engineering",
  "Business",
  "Economics",
  "Science",
]

const fileTypes = ["pdf", "document", "presentation", "image", "video", "audio", "archive"]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [results, setResults] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    categories: [] as string[],
    fileTypes: [] as string[],
    minRating: [0],
    minDownloads: [0],
    sortBy: "relevance",
    dateRange: "all",
  })

  useEffect(() => {
    if (query) {
      handleSearch()
    }
  }, [query])

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const searchResults = await searchResources(query, {
        category: filters.categories.length > 0 ? filters.categories[0] : undefined,
        type: filters.fileTypes.length > 0 ? filters.fileTypes[0] : undefined,
        sortBy: filters.sortBy,
      })

      // Apply additional client-side filtering
      let filteredResults = searchResults

      if (filters.minRating[0] > 0) {
        filteredResults = filteredResults.filter((resource) => resource.rating >= filters.minRating[0])
      }

      if (filters.minDownloads[0] > 0) {
        filteredResults = filteredResults.filter((resource) => resource.downloads >= filters.minDownloads[0])
      }

      setResults(filteredResults)
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: "Failed to search resources. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryFilter = (category: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      categories: checked ? [...prev.categories, category] : prev.categories.filter((c) => c !== category),
    }))
  }

  const handleFileTypeFilter = (fileType: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      fileTypes: checked ? [...prev.fileTypes, fileType] : prev.fileTypes.filter((t) => t !== fileType),
    }))
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      fileTypes: [],
      minRating: [0],
      minDownloads: [0],
      sortBy: "relevance",
      dateRange: "all",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Search Resources</h1>
        <p className="text-gray-600 dark:text-gray-400">Find educational materials across all categories</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search for educational resources..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 h-12 bg-white/80 dark:bg-slate-900/80 border-0 shadow-sm"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading} className="h-12 px-6">
            {loading ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-12 px-6">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                    <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Categories</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={(checked) => handleCategoryFilter(category, checked as boolean)}
                        />
                        <label htmlFor={category} className="text-sm cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* File Types */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">File Types</label>
                  <div className="space-y-2">
                    {fileTypes.map((fileType) => (
                      <div key={fileType} className="flex items-center space-x-2">
                        <Checkbox
                          id={fileType}
                          checked={filters.fileTypes.includes(fileType)}
                          onCheckedChange={(checked) => handleFileTypeFilter(fileType, checked as boolean)}
                        />
                        <label htmlFor={fileType} className="text-sm cursor-pointer capitalize">
                          {fileType}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minimum Rating */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Minimum Rating: {filters.minRating[0]}</label>
                  <Slider
                    value={filters.minRating}
                    onValueChange={(value) => setFilters({ ...filters, minRating: value })}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Minimum Downloads */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Minimum Downloads: {filters.minDownloads[0]}</label>
                  <Slider
                    value={filters.minDownloads}
                    onValueChange={(value) => setFilters({ ...filters, minDownloads: value })}
                    max={5000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {results.length > 0 && (
                <>
                  Showing <span className="font-semibold text-blue-600">{results.length}</span> results
                  {query && (
                    <>
                      {" "}
                      for "<span className="font-semibold">{query}</span>"
                    </>
                  )}
                </>
              )}
            </div>
            {(filters.categories.length > 0 || filters.fileTypes.length > 0) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                {filters.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {category}
                    <XIcon
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleCategoryFilter(category, false)}
                    />
                  </Badge>
                ))}
                {filters.fileTypes.map((fileType) => (
                  <Badge key={fileType} variant="secondary" className="text-xs">
                    {fileType}
                    <XIcon
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleFileTypeFilter(fileType, false)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoaderIcon className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-lg">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((resource) => (
                <Card
                  key={resource.id}
                  className="group overflow-hidden bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800">
                    <img
                      src={resource.file_url || "/placeholder.svg"}
                      alt={resource.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <Badge className="bg-white/90 text-gray-800 shadow-sm text-xs px-2 py-1">
                        {resource.file_type.toUpperCase()}
                      </Badge>
                      {resource.is_featured && (
                        <Badge className="bg-orange-500 text-white shadow-sm text-xs px-2 py-1">FEATURED</Badge>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                          {resource.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {resource.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {resource.category}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{resource.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DownloadIcon className="h-3 w-3" />
                          <span>{resource.downloads}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                        <EyeIcon className="mr-1 h-3 w-3" />
                        Preview
                      </Button>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <HeartIcon className="h-3 w-3" />
                      </Button>
                      <Button size="sm" className="flex-1 text-xs">
                        <DownloadIcon className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-12">
              <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start Your Search</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter keywords to find educational resources across all categories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { supabase } from "./supabase"
import type { Database } from "./database.types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Resource = Database["public"]["Tables"]["resources"]["Row"]
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"]
export type Rating = Database["public"]["Tables"]["ratings"]["Row"]

// Pagination interface
export interface PaginationResult<T> {
  data: T[]
  count: number
  hasMore: boolean
  page: number
  totalPages: number
}

// Profile functions
export async function getProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Optimized resource functions with pagination
export async function getResources(filters?: {
  category?: string
  type?: string
  search?: string
  sortBy?: string
  page?: number
  limit?: number
}): Promise<PaginationResult<Resource>> {
  const page = filters?.page || 1
  const limit = filters?.limit || 12
  const offset = (page - 1) * limit

  let query = supabase
    .from("resources")
    .select(
      `
      *,
      profiles:uploaded_by (
        username,
        full_name,
        avatar_url
      )
    `,
      { count: "exact" },
    )
    .eq("is_approved", true)

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category)
  }

  if (filters?.type && filters.type !== "all") {
    query = query.eq("file_type", filters.type)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // Sorting with performance optimization
  switch (filters?.sortBy) {
    case "popular":
      query = query.order("downloads", { ascending: false })
      break
    case "rating":
      query = query.order("rating", { ascending: false })
      break
    case "name":
      query = query.order("name", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) throw error

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)

  // Handle resources with null uploaded_by (system resources)
  const processedData =
    data?.map((resource) => ({
      ...resource,
      profiles: resource.profiles || {
        username: "System",
        full_name: "System Administrator",
        avatar_url: null,
      },
    })) || []

  return {
    data: processedData,
    count: totalCount,
    hasMore: page < totalPages,
    page,
    totalPages,
  }
}

// Cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

// Get featured resources with caching
export async function getFeaturedResources(limit = 6) {
  const cacheKey = `featured-${limit}`
  const cached = getCachedData<Resource[]>(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase
    .from("resources")
    .select(`
      *,
      profiles:uploaded_by (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("is_featured", true)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error

  const processedData =
    data?.map((resource) => ({
      ...resource,
      profiles: resource.profiles || {
        username: "System",
        full_name: "System Administrator",
        avatar_url: null,
      },
    })) || []

  setCachedData(cacheKey, processedData)
  return processedData
}

// Get popular resources with caching
export async function getPopularResources(limit = 6) {
  const cacheKey = `popular-${limit}`
  const cached = getCachedData<Resource[]>(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase
    .from("resources")
    .select(`
      *,
      profiles:uploaded_by (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("is_approved", true)
    .order("downloads", { ascending: false })
    .limit(limit)

  if (error) throw error

  const processedData =
    data?.map((resource) => ({
      ...resource,
      profiles: resource.profiles || {
        username: "System",
        full_name: "System Administrator",
        avatar_url: null,
      },
    })) || []

  setCachedData(cacheKey, processedData)
  return processedData
}

// Optimized favorites functions
export async function getUserFavorites(userId: string, page = 1, limit = 12): Promise<PaginationResult<any>> {
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from("favorites")
    .select(
      `
      *,
      resources (
        *,
        profiles:uploaded_by (
          username,
          full_name,
          avatar_url
        )
      )
    `,
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)

  const processedData =
    data?.map((favorite) => ({
      ...favorite,
      resources: {
        ...favorite.resources,
        profiles: favorite.resources?.profiles || {
          username: "System",
          full_name: "System Administrator",
          avatar_url: null,
        },
      },
    })) || []

  return {
    data: processedData,
    count: totalCount,
    hasMore: page < totalPages,
    page,
    totalPages,
  }
}

export async function addToFavorites(resourceId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("resource_id", resourceId)
    .single()

  if (existing) {
    throw new Error("Resource already in favorites")
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert({
      user_id: user.id,
      resource_id: resourceId,
    })
    .select()
    .single()

  if (error) throw error

  // Clear cache
  cache.delete(`favorites-${user.id}`)

  return data
}

export async function removeFromFavorites(resourceId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("resource_id", resourceId)

  if (error) throw error

  // Clear cache
  cache.delete(`favorites-${user.id}`)
}

export async function isFavorite(resourceId: string, userId: string) {
  if (!userId) return false

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("resource_id", resourceId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error checking favorite status:", error)
    return false
  }
  return !!data
}

// Batch check favorites for better performance
export async function checkFavorites(resourceIds: string[], userId: string): Promise<Set<string>> {
  if (!userId || resourceIds.length === 0) return new Set()

  const { data, error } = await supabase
    .from("favorites")
    .select("resource_id")
    .eq("user_id", userId)
    .in("resource_id", resourceIds)

  if (error) {
    console.error("Error checking favorites:", error)
    return new Set()
  }

  return new Set(data.map((fav) => fav.resource_id))
}

// Rating functions
export async function rateResource(resourceId: string, rating: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("ratings")
    .upsert({
      user_id: user.id,
      resource_id: resourceId,
      rating,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserRating(resourceId: string, userId: string) {
  if (!userId) return 0

  const { data, error } = await supabase
    .from("ratings")
    .select("rating")
    .eq("user_id", userId)
    .eq("resource_id", resourceId)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("Error getting user rating:", error)
    return 0
  }
  return data?.rating || 0
}

// Batch get user ratings for better performance
export async function getUserRatings(resourceIds: string[], userId: string): Promise<Map<string, number>> {
  if (!userId || resourceIds.length === 0) return new Map()

  const { data, error } = await supabase
    .from("ratings")
    .select("resource_id, rating")
    .eq("user_id", userId)
    .in("resource_id", resourceIds)

  if (error) {
    console.error("Error getting user ratings:", error)
    return new Map()
  }

  return new Map(data.map((rating) => [rating.resource_id, rating.rating]))
}

// Download tracking
export async function trackDownload(resourceId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return // Don't track anonymous downloads

  const { error } = await supabase.from("downloads").insert({
    user_id: user.id,
    resource_id: resourceId,
  })

  if (error) console.error("Error tracking download:", error)
}

// Statistics with caching
export async function getUserStats(userId: string) {
  const cacheKey = `stats-${userId}`
  const cached = getCachedData<any>(cacheKey)
  if (cached) return cached

  const [uploadsResult, favoritesResult, downloadsResult] = await Promise.all([
    supabase.from("resources").select("id", { count: "exact" }).eq("uploaded_by", userId),
    supabase.from("favorites").select("id", { count: "exact" }).eq("user_id", userId),
    supabase.from("downloads").select("id", { count: "exact" }).eq("user_id", userId),
  ])

  const stats = {
    uploads: uploadsResult.count || 0,
    favorites: favoritesResult.count || 0,
    downloads: downloadsResult.count || 0,
  }

  setCachedData(cacheKey, stats)
  return stats
}

// Get trending resources (high downloads in last 7 days)
export async function getTrendingResources(limit = 6) {
  const cacheKey = `trending-${limit}`
  const cached = getCachedData<Resource[]>(cacheKey)
  if (cached) return cached

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data, error } = await supabase
    .from("resources")
    .select(`
      *,
      profiles:uploaded_by (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("is_approved", true)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("downloads", { ascending: false })
    .limit(limit)

  if (error) throw error

  const processedData =
    data?.map((resource) => ({
      ...resource,
      profiles: resource.profiles || {
        username: "System",
        full_name: "System Administrator",
        avatar_url: null,
      },
    })) || []

  setCachedData(cacheKey, processedData)
  return processedData
}

// Get resource categories with counts
export async function getResourceCategories() {
  const cacheKey = "categories"
  const cached = getCachedData<any[]>(cacheKey)
  if (cached) return cached

  const { data, error } = await supabase.from("resources").select("category").eq("is_approved", true)

  if (error) throw error

  const categoryCounts = data.reduce(
    (acc, resource) => {
      const category = resource.category || "Other"
      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const categories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  setCachedData(cacheKey, categories)
  return categories
}

// Search with better performance
export async function searchResources(
  query: string,
  filters?: {
    category?: string
    type?: string
    sortBy?: string
    page?: number
    limit?: number
  },
): Promise<PaginationResult<Resource>> {
  return getResources({
    search: query,
    category: filters?.category,
    type: filters?.type,
    sortBy: filters?.sortBy,
    page: filters?.page,
    limit: filters?.limit,
  })
}

// Create resource
export async function createResource(resource: {
  name: string
  description: string
  file_url: string
  file_type: string
  file_size: number
  category: string
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("resources")
    .insert({
      ...resource,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (error) throw error

  // Clear relevant caches
  cache.delete("featured-6")
  cache.delete("popular-6")
  cache.delete("trending-6")
  cache.delete("categories")

  return data
}

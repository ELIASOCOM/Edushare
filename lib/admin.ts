import { supabase } from "./supabase"

export interface AdminStats {
  totalUsers: number
  totalResources: number
  totalDownloads: number
  totalFavorites: number
  pendingResources: number
  bannedUsers: number
}

export interface UserWithStats {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  role: string | null
  is_banned: boolean
  created_at: string
  resource_count: number
  download_count: number
  favorite_count: number
}

export interface ResourceWithUser {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  is_featured: boolean
  download_count: number
  created_at: string
  uploader: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    return profile?.role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Get total users
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    // Get total resources
    const { count: totalResources } = await supabase.from("resources").select("*", { count: "exact", head: true })

    // Get total downloads
    const { count: totalDownloads } = await supabase.from("downloads").select("*", { count: "exact", head: true })

    // Get total favorites
    const { count: totalFavorites } = await supabase.from("favorites").select("*", { count: "exact", head: true })

    // Get pending resources
    const { count: pendingResources } = await supabase
      .from("resources")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    // Get banned users
    const { count: bannedUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_banned", true)

    return {
      totalUsers: totalUsers || 0,
      totalResources: totalResources || 0,
      totalDownloads: totalDownloads || 0,
      totalFavorites: totalFavorites || 0,
      pendingResources: pendingResources || 0,
      bannedUsers: bannedUsers || 0,
    }
  } catch (error) {
    console.error("Error getting admin stats:", error)
    throw error
  }
}

export async function getAllUsersWithStats(
  page = 1,
  limit = 10,
  search = "",
): Promise<{ users: UserWithStats[]; total: number }> {
  try {
    let query = supabase.from("profiles").select(`
        id,
        username,
        full_name,
        avatar_url,
        role,
        is_banned,
        created_at
      `)

    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    const {
      data: users,
      error,
      count,
    } = await query.range((page - 1) * limit, page * limit - 1).order("created_at", { ascending: false })

    if (error) throw error

    // Get stats for each user
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        // Get resource count
        const { count: resourceCount } = await supabase
          .from("resources")
          .select("*", { count: "exact", head: true })
          .eq("uploaded_by", user.id)

        // Get download count (resources uploaded by this user that were downloaded)
        const { count: downloadCount } = await supabase
          .from("downloads")
          .select("resource_id", { count: "exact", head: true })
          .in("resource_id", supabase.from("resources").select("id").eq("uploaded_by", user.id))

        // Get favorite count (resources uploaded by this user that were favorited)
        const { count: favoriteCount } = await supabase
          .from("favorites")
          .select("resource_id", { count: "exact", head: true })
          .in("resource_id", supabase.from("resources").select("id").eq("uploaded_by", user.id))

        return {
          ...user,
          resource_count: resourceCount || 0,
          download_count: downloadCount || 0,
          favorite_count: favoriteCount || 0,
        }
      }),
    )

    return {
      users: usersWithStats,
      total: count || 0,
    }
  } catch (error) {
    console.error("Error getting users with stats:", error)
    throw error
  }
}

export async function getAllResourcesWithUsers(
  page = 1,
  limit = 10,
  search = "",
  category = "all",
  status = "all",
): Promise<{ resources: ResourceWithUser[]; total: number }> {
  try {
    let query = supabase.from("resources").select(`
        id,
        title,
        description,
        category,
        status,
        is_featured,
        download_count,
        created_at,
        uploaded_by,
        profiles:uploaded_by (
          id,
          username,
          full_name,
          avatar_url
        )
      `)

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category !== "all") {
      query = query.eq("category", category)
    }

    if (status !== "all") {
      query = query.eq("status", status)
    }

    const {
      data: resources,
      error,
      count,
    } = await query.range((page - 1) * limit, page * limit - 1).order("created_at", { ascending: false })

    if (error) throw error

    const formattedResources = (resources || []).map((resource: any) => ({
      ...resource,
      uploader: resource.profiles,
    }))

    return {
      resources: formattedResources,
      total: count || 0,
    }
  } catch (error) {
    console.error("Error getting resources with users:", error)
    throw error
  }
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  try {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)

    if (error) throw error
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

export async function toggleUserBan(userId: string, isBanned: boolean): Promise<void> {
  try {
    const { error } = await supabase.from("profiles").update({ is_banned: isBanned }).eq("id", userId)

    if (error) throw error
  } catch (error) {
    console.error("Error toggling user ban:", error)
    throw error
  }
}

export async function deleteUser(userId: string): Promise<void> {
  try {
    // Delete user's resources first
    await supabase.from("resources").delete().eq("uploaded_by", userId)

    // Delete user's favorites
    await supabase.from("favorites").delete().eq("user_id", userId)

    // Delete user's downloads
    await supabase.from("downloads").delete().eq("user_id", userId)

    // Delete user's ratings
    await supabase.from("ratings").delete().eq("user_id", userId)

    // Delete user's notifications
    await supabase.from("notifications").delete().eq("user_id", userId)

    // Finally delete the user profile
    const { error } = await supabase.from("profiles").delete().eq("id", userId)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  }
}

export async function updateResourceStatus(resourceId: string, status: string): Promise<void> {
  try {
    const { error } = await supabase.from("resources").update({ status }).eq("id", resourceId)

    if (error) throw error
  } catch (error) {
    console.error("Error updating resource status:", error)
    throw error
  }
}

export async function toggleResourceFeatured(resourceId: string, isFeatured: boolean): Promise<void> {
  try {
    const { error } = await supabase.from("resources").update({ is_featured: isFeatured }).eq("id", resourceId)

    if (error) throw error
  } catch (error) {
    console.error("Error toggling resource featured status:", error)
    throw error
  }
}

export async function deleteResource(resourceId: string): Promise<void> {
  try {
    // Delete related records first
    await supabase.from("favorites").delete().eq("resource_id", resourceId)

    await supabase.from("downloads").delete().eq("resource_id", resourceId)

    await supabase.from("ratings").delete().eq("resource_id", resourceId)

    // Delete the resource
    const { error } = await supabase.from("resources").delete().eq("id", resourceId)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting resource:", error)
    throw error
  }
}

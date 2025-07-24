import { supabase } from "./supabase"

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  action_url?: string
  created_at: string
}

// Create notification
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: Notification["type"] = "info",
  actionUrl?: string,
) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title,
      message,
      type,
      action_url: actionUrl,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get user notifications with pagination
export async function getUserNotifications(userId: string, page = 1, limit = 10) {
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return {
    data: data || [],
    count: count || 0,
    hasMore: (count || 0) > offset + limit,
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

  if (error) throw error
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false)

  if (error) throw error
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false)

  if (error) throw error
  return count || 0
}

// Subscribe to real-time notifications
export function subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
  const subscription = supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification)
      },
    )
    .subscribe()

  return subscription
}

// Notification templates
export const NotificationTemplates = {
  newResource: (resourceName: string, category: string) => ({
    title: "New Resource Available!",
    message: `A new ${category} resource "${resourceName}" has been added.`,
    type: "info" as const,
  }),

  resourceLiked: (resourceName: string, likerName: string) => ({
    title: "Resource Liked!",
    message: `${likerName} liked your resource "${resourceName}".`,
    type: "success" as const,
  }),

  resourceRated: (resourceName: string, rating: number) => ({
    title: "New Rating!",
    message: `Your resource "${resourceName}" received a ${rating}-star rating.`,
    type: "success" as const,
  }),

  achievementUnlocked: (achievementName: string) => ({
    title: "Achievement Unlocked!",
    message: `Congratulations! You've unlocked "${achievementName}".`,
    type: "success" as const,
  }),

  weeklyDigest: (newResourcesCount: number) => ({
    title: "Weekly Digest",
    message: `${newResourcesCount} new resources were added this week in your favorite categories.`,
    type: "info" as const,
  }),
}

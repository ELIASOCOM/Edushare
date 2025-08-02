"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AuthDebug() {
  const [users, setUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const checkCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const listUsers = async () => {
    setLoading(true)
    try {
      // Try to get profiles (this will show us what users exist)
      const { data: profiles, error } = await supabase.from("profiles").select("*").limit(10)

      if (error) {
        console.error("Error fetching profiles:", error)
      } else {
        setUsers(profiles || [])
      }
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkCurrentUser()
    listUsers()
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="fixed bottom-4 left-4 w-80 max-h-96 overflow-auto z-50 bg-white border-2">
      <CardHeader>
        <CardTitle className="text-sm">Auth Debug (Dev Only)</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Current User:</strong>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {currentUser ? JSON.stringify(currentUser, null, 2) : "Not signed in"}
          </pre>
        </div>

        <div>
          <strong>Existing Profiles ({users.length}):</strong>
          <Button size="sm" onClick={listUsers} disabled={loading} className="ml-2">
            Refresh
          </Button>
          <div className="bg-gray-100 p-2 rounded max-h-32 overflow-auto">
            {users.length > 0
              ? users.map((user, i) => (
                  <div key={i} className="border-b pb-1 mb-1">
                    <div>Email: {user.email}</div>
                    <div>Admin: {user.is_admin ? "Yes" : "No"}</div>
                    <div>Created: {new Date(user.created_at).toLocaleDateString()}</div>
                  </div>
                ))
              : "No profiles found"}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>💡 Tips:</p>
          <ul className="list-disc list-inside">
            <li>Try signing up first, then signing in</li>
            <li>Check if email confirmation is disabled in Supabase</li>
            <li>Use Magic Link if password login fails</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

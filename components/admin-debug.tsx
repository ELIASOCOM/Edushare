"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminDebug() {
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const checkAdminStatus = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        // Test admin access by counting total PDFs vs approved PDFs
        const { data: allPdfs, error: allError } = await supabase.from("pdfs").select("id, is_approved")
        const { data: approvedPdfs, error: approvedError } = await supabase
          .from("pdfs")
          .select("id")
          .eq("is_approved", true)

        setAdminInfo({
          user: user.email,
          profile: profile,
          isAdmin: profile?.is_admin,
          error: error?.message,
          totalPdfs: allPdfs?.length || 0,
          approvedPdfs: approvedPdfs?.length || 0,
          pendingPdfs: (allPdfs?.length || 0) - (approvedPdfs?.length || 0),
          canSeeAll: profile?.is_admin ? "Should see all PDFs" : "Should see only approved PDFs",
        })
      }
    } catch (err: any) {
      setAdminInfo({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAdminStatus()
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="fixed bottom-20 right-4 w-80 max-h-60 overflow-auto z-50 bg-white border-2">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Admin Debug (Dev Only)
          <Button size="sm" onClick={checkAdminStatus} disabled={loading}>
            {loading ? "Checking..." : "Refresh"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        {adminInfo && (
          <div>
            <div>
              <strong>User:</strong> {adminInfo.user || "Not logged in"}
            </div>
            <div>
              <strong>Is Admin:</strong>
              <Badge variant={adminInfo.isAdmin ? "default" : "secondary"} className="ml-2">
                {adminInfo.isAdmin ? "Yes" : "No"}
              </Badge>
            </div>
            <div>
              <strong>PDF Access:</strong> {adminInfo.canSeeAll}
            </div>
            <div className="text-xs mt-2">
              <div>Total PDFs in DB: {adminInfo.totalPdfs}</div>
              <div>Approved PDFs: {adminInfo.approvedPdfs}</div>
              <div>Pending PDFs: {adminInfo.pendingPdfs}</div>
            </div>
            {adminInfo.profile && (
              <div className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-2">
                <strong>Profile:</strong>
                <pre>{JSON.stringify(adminInfo.profile, null, 2)}</pre>
              </div>
            )}
            {adminInfo.error && (
              <div className="text-red-600">
                <strong>Error:</strong> {adminInfo.error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

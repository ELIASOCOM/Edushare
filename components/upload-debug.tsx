"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UploadDebug() {
  const [testResults, setTestResults] = useState<any>(null)
  const [testing, setTesting] = useState(false)
  const supabase = createClient()

  const runUploadTests = async () => {
    setTesting(true)
    const results: any = {}

    try {
      // Test 1: Check authentication
      const { data: user, error: userError } = await supabase.auth.getUser()
      results.auth = {
        success: !userError && !!user.user,
        user: user.user?.email,
        error: userError?.message,
      }

      // Test 2: Check profile exists
      if (user.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.user.id)
          .single()

        results.profile = {
          success: !profileError && !!profile,
          profile: profile,
          error: profileError?.message,
        }
      }

      // Test 3: Check storage bucket access
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      results.storage = {
        success: !bucketError,
        buckets: buckets?.map((b) => b.name),
        hasEduResources: buckets?.some((b) => b.name === "edu-resources"),
        error: bucketError?.message,
      }

      // Test 4: Test storage permissions (try to list files)
      if (user.user) {
        const { data: files, error: listError } = await supabase.storage
          .from("edu-resources")
          .list(user.user.id, { limit: 1 })

        results.storagePermissions = {
          success: !listError,
          canList: !listError,
          error: listError?.message,
        }
      }

      // Test 5: Check database insert permissions
      if (user.user) {
        const testData = {
          title: "Test Upload",
          description: "Test description",
          file_path: `${user.user.id}/test.pdf`,
          file_size: 1000,
          user_id: user.user.id,
        }

        // Try to insert (we'll delete it immediately)
        const { data: insertData, error: insertError } = await supabase.from("pdfs").insert(testData).select().single()

        results.databaseInsert = {
          success: !insertError,
          error: insertError?.message,
        }

        // Clean up test record
        if (insertData) {
          await supabase.from("pdfs").delete().eq("id", insertData.id)
        }
      }
    } catch (error: any) {
      results.generalError = error.message
    }

    setTestResults(results)
    setTesting(false)
  }

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="fixed top-4 right-4 w-96 max-h-96 overflow-auto z-50 bg-white border-2">
      <CardHeader>
        <CardTitle className="text-sm">Upload Debug (Dev Only)</CardTitle>
        <Button size="sm" onClick={runUploadTests} disabled={testing}>
          {testing ? "Testing..." : "Run Upload Tests"}
        </Button>
      </CardHeader>
      <CardContent className="text-xs">
        {testResults && (
          <div className="space-y-2">
            <div>
              <strong>Authentication:</strong>{" "}
              <span className={testResults.auth.success ? "text-green-600" : "text-red-600"}>
                {testResults.auth.success ? "✓ Pass" : "✗ Fail"}
              </span>
              {testResults.auth.user && <div>User: {testResults.auth.user}</div>}
              {testResults.auth.error && <div className="text-red-600">Error: {testResults.auth.error}</div>}
            </div>

            <div>
              <strong>Profile:</strong>{" "}
              <span className={testResults.profile?.success ? "text-green-600" : "text-red-600"}>
                {testResults.profile?.success ? "✓ Pass" : "✗ Fail"}
              </span>
              {testResults.profile?.error && <div className="text-red-600">Error: {testResults.profile.error}</div>}
            </div>

            <div>
              <strong>Storage Access:</strong>{" "}
              <span className={testResults.storage.success ? "text-green-600" : "text-red-600"}>
                {testResults.storage.success ? "✓ Pass" : "✗ Fail"}
              </span>
              <div>Has edu-resources: {testResults.storage.hasEduResources ? "Yes" : "No"}</div>
              {testResults.storage.error && <div className="text-red-600">Error: {testResults.storage.error}</div>}
            </div>

            <div>
              <strong>Storage Permissions:</strong>{" "}
              <span className={testResults.storagePermissions?.success ? "text-green-600" : "text-red-600"}>
                {testResults.storagePermissions?.success ? "✓ Pass" : "✗ Fail"}
              </span>
              {testResults.storagePermissions?.error && (
                <div className="text-red-600">Error: {testResults.storagePermissions.error}</div>
              )}
            </div>

            <div>
              <strong>Database Insert:</strong>{" "}
              <span className={testResults.databaseInsert?.success ? "text-green-600" : "text-red-600"}>
                {testResults.databaseInsert?.success ? "✓ Pass" : "✗ Fail"}
              </span>
              {testResults.databaseInsert?.error && (
                <div className="text-red-600">Error: {testResults.databaseInsert.error}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

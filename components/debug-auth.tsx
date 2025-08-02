"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugAuth() {
  const [authState, setAuthState] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          setError(error.message)
        } else {
          setAuthState(data)
        }
      } catch (err: any) {
        setError(err.message)
      }
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session)
      setAuthState({ session, event })
    })

    return () => subscription.unsubscribe()
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-60 overflow-auto z-50">
      <CardHeader>
        <CardTitle className="text-sm">Auth Debug</CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        {error && <div className="text-red-500 mb-2">Error: {error}</div>}
        <pre className="whitespace-pre-wrap">{JSON.stringify(authState, null, 2)}</pre>
      </CardContent>
    </Card>
  )
}

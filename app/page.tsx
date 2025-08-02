"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import AuthForm from "@/components/auth-form"
import Dashboard from "@/components/dashboard"
import AuthDebug from "@/components/auth-debug"
import { Loader2, Sparkles, BookOpen, Users, Heart } from "lucide-react"

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session)
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
          <p className="text-purple-600 mt-2 font-medium">Loading EduResources...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            EduResources
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Share, discover, and access thousands of educational PDFs with our vibrant learning community
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50 shadow-lg">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-slate-700 font-medium">Global Community</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200/50 shadow-lg">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-slate-700 font-medium">Premium Quality</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-pink-200/50 shadow-lg">
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="text-slate-700 font-medium">Always Free</span>
            </div>
          </div>
        </div>

        <AuthForm />
      </div>
      <AuthDebug />
    </div>
  )
}

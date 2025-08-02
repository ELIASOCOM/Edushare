"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const clearError = () => {
    setAuthError(null)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearError()

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Signup error:", error)
        setAuthError(error.message)
        toast({
          title: "Signup Error",
          description: error.message,
          variant: "destructive",
        })
      } else if (data.user) {
        // Check if email confirmation is disabled (user has immediate session)
        if (data.session) {
          toast({
            title: "Account created!",
            description: "Welcome to EduResources! You can now start uploading and viewing PDFs.",
          })
          // Clear form
          setEmail("")
          setPassword("")
        } else if (!data.user.email_confirmed_at) {
          toast({
            title: "Check your email!",
            description:
              "We sent you a confirmation link. Please check your email and click the link to activate your account.",
          })
        } else {
          toast({
            title: "Account created!",
            description: "Your account has been created successfully.",
          })
        }
      }
    } catch (err: any) {
      console.error("Unexpected error:", err)
      const errorMessage = err.message || "Something went wrong. Please try again."
      setAuthError(errorMessage)
      toast({
        title: "Unexpected Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearError()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Signin error:", error)
        let errorMessage = error.message

        // Provide more helpful error messages
        if (error.message === "Invalid login credentials") {
          errorMessage = "Invalid email or password. Please check your credentials and try again."
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email and click the confirmation link before signing in."
        }

        setAuthError(errorMessage)
        toast({
          title: "Sign In Error",
          description: errorMessage,
          variant: "destructive",
        })
      } else if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        })
        // Clear form
        setEmail("")
        setPassword("")
        clearError()
      }
    } catch (err: any) {
      console.error("Unexpected error:", err)
      const errorMessage = err.message || "Something went wrong. Please try again."
      setAuthError(errorMessage)
      toast({
        title: "Unexpected Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearError()

    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Magic link error:", error)
        setAuthError(error.message)
        toast({
          title: "Magic Link Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setMagicLinkSent(true)
        toast({
          title: "Magic link sent!",
          description: "Check your email for the login link",
        })
      }
    } catch (err: any) {
      console.error("Unexpected error:", err)
      const errorMessage = err.message || "Something went wrong. Please try again."
      setAuthError(errorMessage)
      toast({
        title: "Unexpected Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <Mail className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <CardTitle>Check your email</CardTitle>
          <CardDescription>We've sent you a magic link to sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full bg-transparent" onClick={() => setMagicLinkSent(false)}>
            Back to login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Sign in to your account or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        {authError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" onClick={clearError}>
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" onClick={clearError}>
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearError()
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearError()
                  }}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleMagicLink}>
              <Button type="submit" variant="outline" className="w-full bg-transparent" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Mail className="mr-2 h-4 w-4" />
                Magic Link
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearError()
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    clearError()
                  }}
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Having trouble? Try using the Magic Link option above.</p>
        </div>
      </CardContent>
    </Card>
  )
}

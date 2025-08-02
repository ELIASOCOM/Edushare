"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2, FileText, AlertCircle, CheckCircle, X, Clock, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess: () => void
}

export default function UploadDialog({ open, onOpenChange, onUploadSuccess }: UploadDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadStep, setUploadStep] = useState<string>("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setUploadError(null)

    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (selectedFile.size > maxSize) {
          setUploadError("File size must be less than 10MB")
          return
        }
        setFile(selectedFile)
      } else {
        setUploadError("Please select a PDF file")
        setFile(null)
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) return

    setUploading(true)
    setUploadError(null)
    setUploadProgress(0)
    setUploadSuccess(false)
    setNeedsApproval(false)

    try {
      setUploadStep("Authenticating...")
      setUploadProgress(10)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("Authentication failed. Please sign in again.")
      }

      setUploadStep("Verifying user profile...")
      setUploadProgress(20)

      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, is_admin")
        .eq("id", user.id)
        .single()

      if (profileError || !profile) {
        console.log("Creating user profile...")
        const { error: createError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          is_admin: user.email === "ocomelias8@gmail.com",
        })

        if (createError) {
          console.error("Profile creation failed:", createError)
          throw new Error(`Profile creation failed: ${createError.message}`)
        }

        const { data: newProfile } = await supabase
          .from("profiles")
          .select("id, email, is_admin")
          .eq("id", user.id)
          .single()
        profile = newProfile
      }

      setUploadStep("Preparing file upload...")
      setUploadProgress(40)

      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const fileName = `${timestamp}-${randomId}.pdf`
      const filePath = `${user.id}/${fileName}`

      setUploadStep("Uploading file to storage...")
      setUploadProgress(60)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("edu-resources")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Storage upload failed:", uploadError)
        throw new Error(`File upload failed: ${uploadError.message}`)
      }

      setUploadStep("Saving file information...")
      setUploadProgress(80)

      const isApproved = profile?.is_admin || false
      const willNeedApproval = !isApproved

      const { data: pdfData, error: dbError } = await supabase
        .from("pdfs")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          file_path: filePath,
          file_size: file.size,
          user_id: user.id,
          is_approved: isApproved,
        })
        .select()
        .single()

      if (dbError) {
        console.error("Database insert failed:", dbError)
        await supabase.storage.from("edu-resources").remove([filePath])
        throw new Error(`Database save failed: ${dbError.message}`)
      }

      setUploadStep("Upload completed successfully!")
      setUploadProgress(100)
      setUploadSuccess(true)
      setNeedsApproval(willNeedApproval)

      if (isApproved) {
        toast({
          title: "Success!",
          description: `"${title}" has been uploaded and is now live!`,
        })
      } else {
        toast({
          title: "Upload Successful!",
          description: `"${title}" has been uploaded and is pending admin approval.`,
        })
      }

      setTimeout(() => {
        setTitle("")
        setDescription("")
        setFile(null)
        setUploadStep("")
        setUploadProgress(0)
        setUploadSuccess(false)
        setNeedsApproval(false)
        onOpenChange(false)
        onUploadSuccess()
      }, 3000)
    } catch (error: any) {
      console.error("Upload failed:", error)
      const errorMessage = error.message || "Upload failed. Please try again."
      setUploadError(errorMessage)
      setUploadStep("")
      setUploadProgress(0)
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setFile(null)
    setUploadError(null)
    setUploadStep("")
    setUploadProgress(0)
    setUploadSuccess(false)
    setNeedsApproval(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen && !uploading) {
          resetForm()
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg md:text-xl font-bold text-slate-900">Upload PDF Resource</DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                Share an educational PDF with the community
              </DialogDescription>
            </div>
            {!uploading && (
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {uploadError && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{uploadError}</AlertDescription>
            </Alert>
          )}

          {uploadSuccess && needsApproval && (
            <Alert className="border-orange-200 bg-orange-50">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                <div className="space-y-2">
                  <div className="font-medium">📋 Your file is pending approval</div>
                  <div>
                    Your PDF has been successfully uploaded and is now in the approval queue. An admin will review it
                    within <strong>1-24 hours</strong>.
                  </div>
                  <div className="text-xs">
                    ✅ You'll be able to see it in your uploads
                    <br />⏳ Others will see it once approved
                    <br />📧 You'll get notified when it's live
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {uploadSuccess && !needsApproval && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                <div className="space-y-2">
                  <div className="font-medium">🎉 Your file is now live!</div>
                  <div>Your PDF has been uploaded and is immediately available to all users.</div>
                  <div className="text-xs flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin privileges - no approval needed
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {uploadStep && !uploadSuccess && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">{uploadStep}</AlertDescription>
            </Alert>
          )}

          {uploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-slate-600 text-center">{uploadProgress}% complete</p>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setUploadError(null)
                }}
                placeholder="Enter a descriptive title for your PDF"
                required
                disabled={uploading}
                maxLength={100}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-slate-500">{title.length}/100 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setUploadError(null)
                }}
                placeholder="Describe what this PDF contains (optional)"
                rows={3}
                disabled={uploading}
                maxLength={500}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none text-sm"
              />
              <p className="text-xs text-slate-500">{description.length}/500 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file" className="text-sm font-medium text-slate-700">
                PDF File *
              </Label>
              <div className="relative">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  required
                  disabled={uploading}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <p className="text-xs text-slate-500">Maximum file size: 10MB • PDF files only</p>
              {file && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 truncate">{file.name}</p>
                    <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                </div>
              )}
            </div>

            {/* Approval Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <div className="font-medium mb-1">📋 Approval Process</div>
                  <div>
                    • Your upload will be reviewed by our admin team
                    <br />• Approval typically takes 1-24 hours
                    <br />• You can see your uploads immediately in your profile
                    <br />• Others will see it once approved
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed button container */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={uploading}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading || !file || !title.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                size="sm"
              >
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload PDF"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

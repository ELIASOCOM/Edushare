"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { UploadIcon, FileIcon, LoaderIcon, XIcon } from "lucide-react"
import { createResource } from "@/lib/database"

const categories = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Literature",
  "Computer Science",
  "Art",
  "Geography",
  "Music",
  "Psychology",
  "Languages",
  "Philosophy",
  "Engineering",
  "Business",
  "Economics",
  "Science",
]

const fileTypes = [
  { value: "pdf", label: "PDF Document" },
  { value: "document", label: "Document (DOC/DOCX)" },
  { value: "presentation", label: "Presentation (PPT/PPTX)" },
  { value: "image", label: "Image (JPG/PNG/GIF)" },
  { value: "video", label: "Video (MP4/AVI/MOV)" },
  { value: "audio", label: "Audio (MP3/WAV)" },
  { value: "archive", label: "Archive (ZIP/RAR)" },
]

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    file_type: "",
    file_url: "",
    file_size: 0,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to upload educational resources.</p>
          <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
        </div>
      </div>
    )
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)

    // Auto-detect file type
    const extension = file.name.split(".").pop()?.toLowerCase()
    let detectedType = "document"

    if (extension) {
      if (["pdf"].includes(extension)) detectedType = "pdf"
      else if (["doc", "docx", "txt", "rtf"].includes(extension)) detectedType = "document"
      else if (["ppt", "pptx"].includes(extension)) detectedType = "presentation"
      else if (["jpg", "jpeg", "png", "gif", "bmp"].includes(extension)) detectedType = "image"
      else if (["mp4", "avi", "mov", "wmv", "flv"].includes(extension)) detectedType = "video"
      else if (["mp3", "wav", "flac", "aac"].includes(extension)) detectedType = "audio"
      else if (["zip", "rar", "7z", "tar"].includes(extension)) detectedType = "archive"
    }

    setFormData((prev) => ({
      ...prev,
      name: prev.name || file.name.replace(/\.[^/.]+$/, ""),
      file_type: detectedType,
      file_size: file.size,
    }))
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const simulateFileUpload = async (file: File): Promise<string> => {
    // Simulate file upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, you would upload to Supabase Storage or another service
    // For now, we'll use a placeholder URL based on file type
    const fileTypeMap: { [key: string]: string } = {
      pdf: "PDF+Document",
      document: "Document+File",
      presentation: "Presentation+File",
      image: "Image+File",
      video: "Video+File",
      audio: "Audio+File",
      archive: "Archive+File",
    }

    const queryText = fileTypeMap[formData.file_type] || "Educational+Resource"
    return `/placeholder.svg?height=400&width=300&text=${queryText}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.description || !formData.category || !formData.file_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // Simulate file upload
      const fileUrl = await simulateFileUpload(selectedFile)

      // Create resource in database
      await createResource({
        name: formData.name,
        description: formData.description,
        file_url: fileUrl,
        file_type: formData.file_type,
        file_size: formData.file_size,
        category: formData.category,
      })

      toast({
        title: "Success!",
        description: "Your resource has been uploaded successfully.",
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        file_type: "",
        file_url: "",
        file_size: 0,
      })
      setSelectedFile(null)

      // Redirect to home page
      router.push("/")
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upload Educational Resource</h1>
          <p className="text-gray-600 dark:text-gray-400">Share your educational materials with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload Area */}
          <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Select File</CardTitle>
              <CardDescription>Upload your educational resource file (Max 100MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.zip,.rar"
                />

                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto">
                      <FileIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                      <XIcon className="h-4 w-4 mr-2" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto">
                      <UploadIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Drop your file here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Supports PDF, DOC, PPT, images, videos, audio, and archives
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resource Details */}
          <Card className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Resource Details</CardTitle>
              <CardDescription>Provide information about your educational resource</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Resource Name *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter resource name"
                    className="bg-white/50 dark:bg-slate-900/50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="file_type" className="text-sm font-medium">
                  File Type *
                </label>
                <Select
                  value={formData.file_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, file_type: value }))}
                >
                  <SelectTrigger className="bg-white/50 dark:bg-slate-900/50">
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description *
                </label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your educational resource..."
                  rows={4}
                  className="bg-white/50 dark:bg-slate-900/50 resize-none"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/")} disabled={uploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading || !selectedFile}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {uploading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload Resource
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

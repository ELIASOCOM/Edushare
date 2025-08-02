"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Download, Heart, AlertCircle, RefreshCw, Maximize2, Minimize2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PDF {
  id: string
  title: string
  description: string
  file_path: string
  file_size: number
  likes_count: number
  download_count: number
  created_at: string
  user_id: string
  user_email: string
  user_liked: boolean
}

interface PDFViewerProps {
  pdf: PDF
  onBack: () => void
}

export default function PDFViewer({ pdf, onBack }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPdf, setCurrentPdf] = useState<PDF>(pdf)
  const [viewError, setViewError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadPDF()
    return () => {
      // Cleanup blob URL when component unmounts
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdf])

  const loadPDF = async () => {
    setLoading(true)
    setViewError(null)
    setDebugInfo(null)

    try {
      console.log("Loading PDF from path:", pdf.file_path)

      // First, let's check if the file exists
      const { data: fileList, error: listError } = await supabase.storage
        .from("edu-resources")
        .list(pdf.file_path.split("/")[0], {
          limit: 100,
          offset: 0,
        })

      console.log("File list result:", { fileList, listError })

      // Try to get the file info first
      const { data: fileInfo, error: infoError } = await supabase.storage
        .from("edu-resources")
        .getPublicUrl(pdf.file_path)

      console.log("File info:", { fileInfo, infoError })

      // Try to download the file
      const { data, error } = await supabase.storage.from("edu-resources").download(pdf.file_path)

      console.log("Download result:", { data, error, filePath: pdf.file_path })

      setDebugInfo({
        filePath: pdf.file_path,
        fileList: fileList?.slice(0, 5), // Show first 5 files
        listError: listError?.message,
        publicUrl: fileInfo?.publicUrl,
        downloadError: error?.message,
        hasData: !!data,
        dataSize: data ? data.size : 0,
      })

      if (error) {
        console.error("Storage download error:", error)

        // Try alternative file paths
        const alternativePaths = [
          pdf.file_path,
          pdf.file_path.replace(/^\/+/, ""), // Remove leading slashes
          `${pdf.user_id}/${pdf.file_path.split("/").pop()}`, // Reconstruct path
        ]

        let downloadSuccess = false
        let lastError = error

        for (const altPath of alternativePaths) {
          if (altPath === pdf.file_path) continue // Skip the original path we already tried

          console.log("Trying alternative path:", altPath)
          const { data: altData, error: altError } = await supabase.storage.from("edu-resources").download(altPath)

          if (!altError && altData) {
            console.log("Success with alternative path:", altPath)
            const blob = new Blob([altData], { type: "application/pdf" })
            const url = URL.createObjectURL(blob)
            setPdfUrl(url)
            downloadSuccess = true
            break
          } else {
            lastError = altError
          }
        }

        if (!downloadSuccess) {
          throw new Error(`Failed to load PDF: ${lastError?.message || "Unknown error"}`)
        }
      } else if (!data) {
        throw new Error("No data received from storage")
      } else {
        // Create blob URL for PDF viewing
        const blob = new Blob([data], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
        console.log("PDF loaded successfully, blob URL created")
      }
    } catch (error: any) {
      console.error("PDF load error:", error)
      setViewError(error.message || "Failed to load PDF")
      toast({
        title: "Error",
        description: "Failed to load PDF for viewing",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      // Try the same download logic as the viewer
      let downloadData = null
      let downloadError = null

      const { data, error } = await supabase.storage.from("edu-resources").download(pdf.file_path)

      if (error || !data) {
        // Try alternative paths for download too
        const alternativePaths = [
          pdf.file_path.replace(/^\/+/, ""), // Remove leading slashes
          `${pdf.user_id}/${pdf.file_path.split("/").pop()}`, // Reconstruct path
        ]

        for (const altPath of alternativePaths) {
          const { data: altData, error: altError } = await supabase.storage.from("edu-resources").download(altPath)

          if (!altError && altData) {
            downloadData = altData
            break
          }
          downloadError = altError
        }

        if (!downloadData) {
          throw downloadError || error || new Error("Failed to download file")
        }
      } else {
        downloadData = data
      }

      // Increment download count
      await supabase.rpc("increment_download_count", { pdf_id: pdf.id })

      // Create download
      const blob = new Blob([downloadData], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${pdf.title}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Update local state
      setCurrentPdf((prev) => ({ ...prev, download_count: prev.download_count + 1 }))

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      })
    } catch (error: any) {
      console.error("Download error:", error)
      toast({
        title: "Error",
        description: `Failed to download PDF: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleLike = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      if (currentPdf.user_liked) {
        await supabase.from("pdf_likes").delete().eq("pdf_id", pdf.id).eq("user_id", user.id)
      } else {
        await supabase.from("pdf_likes").insert({ pdf_id: pdf.id, user_id: user.id })
      }

      // Update local state
      setCurrentPdf((prev) => ({
        ...prev,
        user_liked: !prev.user_liked,
        likes_count: prev.user_liked ? prev.likes_count - 1 : prev.likes_count + 1,
      }))
    } catch (error) {
      console.error("Like error:", error)
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              <Button variant="ghost" onClick={onBack} className="hover:bg-slate-100 flex-shrink-0">
                <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="border-l border-slate-300 pl-2 md:pl-4 flex-1 min-w-0">
                <h1 className="text-sm md:text-xl font-bold text-slate-900 line-clamp-1">{currentPdf.title}</h1>
                <p className="text-xs md:text-sm text-slate-600 truncate">By {currentPdf.user_email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 md:space-x-3 flex-shrink-0">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">
                {formatFileSize(currentPdf.file_size)}
              </Badge>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs hidden sm:inline-flex">
                <Download className="w-3 h-3 mr-1" />
                {currentPdf.download_count}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLike} className="hover:bg-red-50 p-1 md:p-2">
                <Heart
                  className={`w-4 h-4 ${currentPdf.user_liked ? "fill-current text-red-500" : "text-slate-600"}`}
                />
                <span className={`ml-1 text-xs ${currentPdf.user_liked ? "text-red-500" : "text-slate-600"}`}>
                  {currentPdf.likes_count}
                </span>
              </Button>
              <Button onClick={handleDownload} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        {/* Description Card - Mobile Optimized */}
        {currentPdf.description && (
          <Card className="mb-4 md:mb-6 border-gray-200 shadow-sm">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-base md:text-lg text-slate-900">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-slate-700 leading-relaxed">{currentPdf.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === "development" && debugInfo && (
          <Card className="mb-4 md:mb-6 border-orange-200 bg-orange-50">
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-base md:text-lg text-orange-900">Debug Info (Dev Only)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-orange-800 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
            </CardContent>
          </Card>
        )}

        {/* PDF Viewer Card - Mobile Optimized */}
        <Card className="border-gray-200 shadow-lg">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-sm md:text-base text-slate-600">Loading PDF...</p>
              </div>
            ) : viewError ? (
              <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4 p-4 md:p-8">
                <Alert variant="destructive" className="max-w-md">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{viewError}</AlertDescription>
                </Alert>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button onClick={loadPDF} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button onClick={handleDownload} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Instead
                  </Button>
                </div>
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-slate-500 mt-4 max-w-md text-center">
                    <p>
                      <strong>File Path:</strong> {pdf.file_path}
                    </p>
                    <p>
                      <strong>User ID:</strong> {pdf.user_id}
                    </p>
                  </div>
                )}
              </div>
            ) : pdfUrl ? (
              <div className="relative">
                {/* Fullscreen Toggle Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white shadow-sm md:hidden"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>

                <div
                  className={`w-full ${isFullscreen ? "fixed inset-0 z-50 bg-white" : "relative"}`}
                  style={{
                    height: isFullscreen ? "100vh" : window.innerWidth < 768 ? "70vh" : "calc(100vh - 200px)",
                  }}
                >
                  <iframe
                    src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    className={`w-full h-full border-0 ${isFullscreen ? "" : "rounded-b-lg"}`}
                    title={currentPdf.title}
                    allow="fullscreen"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 md:h-96 space-y-4">
                <AlertCircle className="w-8 h-8 md:w-12 md:h-12 text-slate-400" />
                <p className="text-sm md:text-base text-slate-500">Unable to display PDF</p>
                <Button onClick={handleDownload} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download to View
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

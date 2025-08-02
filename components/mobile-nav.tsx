"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu, Upload, Settings, LogOut, User, FileText, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MobileNavProps {
  user: any
  isAdmin: boolean
  onUpload: () => void
  onAdminPanel: () => void
  onSignOut: () => void
  pdfCount: number
}

export default function MobileNav({ user, isAdmin, onUpload, onAdminPanel, onSignOut, pdfCount }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-white">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-blue-600 font-bold">EduResources</span>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate text-sm">{user?.email}</p>
              {isAdmin && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs mt-1">
                  Administrator
                </Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-blue-900">{pdfCount}</p>
              <p className="text-xs text-blue-600">Resources</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <Heart className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-900">Active</p>
              <p className="text-xs text-green-600">Community</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                onUpload()
                setOpen(false)
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 justify-start"
            >
              <Upload className="w-4 h-4 mr-3" />
              Upload PDF
            </Button>

            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => {
                  onAdminPanel()
                  setOpen(false)
                }}
                className="w-full justify-start border-slate-300"
              >
                <Settings className="w-4 h-4 mr-3" />
                Admin Panel
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => {
                onSignOut()
                setOpen(false)
              }}
              className="w-full justify-start text-slate-600 hover:text-slate-900"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>

          {/* Quick Tips */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2 text-sm">💡 Quick Tips</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• Use descriptive titles for better discovery</li>
              <li>• Add descriptions to help others understand your content</li>
              <li>• Like resources to bookmark them for later</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

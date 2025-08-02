"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Mail, Copy, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface SocialShareProps {
  pdf: {
    id: string
    title: string
    description: string
    user_email: string
  }
  className?: string
}

export default function SocialShare({ pdf, className = "" }: SocialShareProps) {
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const shareUrl = `${window.location.origin}/pdf/${pdf.id}`
  const shareText = `Check out "${pdf.title}" on EduResources - Free Educational PDFs`
  const whatsappChannelUrl = "https://whatsapp.com/channel/0029VbAoenUEQIamfDBKsT2x"

  const incrementShareCount = async () => {
    try {
      await supabase.rpc("increment_share_count", { pdf_id: pdf.id })
    } catch (error) {
      console.error("Failed to increment share count:", error)
    }
  }

  const handleShare = async (platform: string, url: string) => {
    setIsSharing(true)
    await incrementShareCount()

    window.open(url, "_blank", "width=600,height=400")

    toast({
      title: "Shared!",
      description: `PDF shared on ${platform}`,
    })

    setTimeout(() => setIsSharing(false), 1000)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      await incrementShareCount()
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}\n\nJoin our channel: ${whatsappChannelUrl}`)}`,
      color: "text-green-600",
      bgColor: "hover:bg-green-50",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      color: "text-blue-600",
      bgColor: "hover:bg-blue-50",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=Education,PDF,Learning`,
      color: "text-sky-600",
      bgColor: "hover:bg-sky-50",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(pdf.title)}&summary=${encodeURIComponent(pdf.description || shareText)}`,
      color: "text-blue-700",
      bgColor: "hover:bg-blue-50",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(pdf.title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}\n\nShared by: ${pdf.user_email}\n\nJoin our WhatsApp channel for more resources: ${whatsappChannelUrl}`)}`,
      color: "text-gray-600",
      bgColor: "hover:bg-gray-50",
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`hover:bg-purple-50 text-slate-600 ${className}`}
          disabled={isSharing}
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 text-sm font-medium text-slate-900 border-b">
          Share "{pdf.title.substring(0, 30)}..."
        </div>

        {shareOptions.map((option) => (
          <DropdownMenuItem
            key={option.name}
            onClick={() => handleShare(option.name, option.url)}
            className={`cursor-pointer ${option.bgColor}`}
          >
            <option.icon className={`w-4 h-4 mr-3 ${option.color}`} />
            <span>Share on {option.name}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer hover:bg-slate-50">
          <Copy className="w-4 h-4 mr-3 text-slate-600" />
          <span>Copy Link</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => window.open(whatsappChannelUrl, "_blank")}
          className="cursor-pointer hover:bg-green-50"
        >
          <ExternalLink className="w-4 h-4 mr-3 text-green-600" />
          <span>Join WhatsApp Channel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

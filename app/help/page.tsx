import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  HelpCircle,
  Upload,
  Download,
  Search,
  Heart,
  MessageCircle,
  Mail,
  ArrowLeft,
  BookOpen,
  Users,
  Shield,
} from "lucide-react"
import Link from "next/link"
import Footer from "@/components/footer"

export default function HelpCenter() {
  const faqs = [
    {
      question: "How do I upload a PDF?",
      answer:
        "Click the 'Upload' button in the header, fill in the title and description, select your PDF file (max 10MB), and click 'Upload PDF'. Your file will be reviewed by our admin team within 24 hours.",
      icon: Upload,
      category: "Upload",
    },
    {
      question: "Why isn't my uploaded PDF visible to others?",
      answer:
        "All uploads go through an approval process to ensure quality and appropriateness. Your PDF will be visible to you immediately, but others will see it only after admin approval (usually within 1-24 hours).",
      icon: Shield,
      category: "Approval",
    },
    {
      question: "How do I download a PDF?",
      answer:
        "Click on any PDF card to view it, then click the 'Download' button. You can also download directly from the main dashboard by clicking the download icon on each PDF card.",
      icon: Download,
      category: "Download",
    },
    {
      question: "How do I search for specific resources?",
      answer:
        "Use the search bar at the top of the dashboard. You can search by title, description, or author email. You can also filter by newest, most liked, or most downloaded.",
      icon: Search,
      category: "Search",
    },
    {
      question: "What does the heart/like button do?",
      answer:
        "Liking a PDF helps others discover quality content and bookmarks it for you. You can see all your liked PDFs in your profile section.",
      icon: Heart,
      category: "Features",
    },
    {
      question: "What file formats are supported?",
      answer:
        "Currently, we only support PDF files up to 10MB in size. Make sure your file is a valid PDF before uploading.",
      icon: BookOpen,
      category: "Files",
    },
    {
      question: "How do I join the WhatsApp channel?",
      answer:
        "Click on any 'Join WhatsApp Channel' link throughout the site, or visit our footer links. Our channel provides updates on new resources and educational content.",
      icon: MessageCircle,
      category: "Community",
    },
    {
      question: "Is EduResources really free?",
      answer:
        "Yes! EduResources is completely free to use. We believe education should be accessible to everyone. There are no hidden fees or premium subscriptions.",
      icon: Users,
      category: "General",
    },
  ]

  const categories = ["All", "Upload", "Download", "Search", "Features", "Files", "Community", "General", "Approval"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-purple-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="hover:bg-purple-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="border-l border-purple-300 pl-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Help Center
                </h1>
                <p className="text-sm text-slate-600">Get help and find answers to common questions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="https://whatsapp.com/channel/0029VbAoenUEQIamfDBKsT2x" target="_blank">
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">How can we help you?</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Find answers to frequently asked questions and get the most out of EduResources
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-blue-900">Upload Guide</CardTitle>
              <CardDescription>Learn how to upload your first PDF</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/guidelines">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent">
                  View Guidelines
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-purple-900">Community</CardTitle>
              <CardDescription>Join our WhatsApp channel</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="https://whatsapp.com/channel/0029VbAoenUEQIamfDBKsT2x" target="_blank">
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                >
                  Join Channel
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100/50 hover:shadow-lg transition-all">
            <CardHeader className="text-center">
              <Mail className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <CardTitle className="text-pink-900">Contact Us</CardTitle>
              <CardDescription>Get direct support</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="mailto:hello@eduresources.com">
                <Button variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50 bg-transparent">
                  Send Email
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Frequently Asked Questions</h3>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="cursor-pointer hover:bg-purple-100 bg-white/80 backdrop-blur-sm border border-purple-200"
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* FAQ Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border-purple-200/50 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all"
              >
                <CardHeader>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <faq.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg text-slate-900">{faq.question}</CardTitle>
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          {faq.category}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-600 leading-relaxed">{faq.answer}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-900">Still need help?</CardTitle>
            <CardDescription className="text-lg">
              Our community and support team are here to help you succeed
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="https://whatsapp.com/channel/0029VbAoenUEQIamfDBKsT2x" target="_blank">
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join WhatsApp Channel
                </Button>
              </Link>
              <Link href="mailto:hello@eduresources.com">
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-500">Response time: WhatsApp Channel (instant) • Email (24-48 hours)</p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

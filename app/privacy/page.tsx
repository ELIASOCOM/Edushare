import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, Eye, Database, Cookie, ArrowLeft, Mail, MessageCircle, FileText, Users } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/footer"

export default function Privacy() {
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      color: "blue",
      content: [
        {
          subtitle: "Account Information",
          details: "Email address, profile information, and authentication data when you create an account.",
        },
        {
          subtitle: "Content Data",
          details: "PDFs you upload, titles, descriptions, and metadata associated with your educational resources.",
        },
        {
          subtitle: "Usage Analytics",
          details: "How you interact with our platform, including views, downloads, likes, and search queries.",
        },
        {
          subtitle: "Technical Data",
          details: "IP address, browser type, device information, and cookies for platform functionality.",
        },
      ],
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      color: "purple",
      content: [
        {
          subtitle: "Platform Operation",
          details: "To provide, maintain, and improve our educational resource sharing platform.",
        },
        {
          subtitle: "Content Management",
          details: "To review, approve, and organize uploaded educational materials for quality assurance.",
        },
        {
          subtitle: "Communication",
          details: "To send important updates, notifications, and respond to your inquiries.",
        },
        {
          subtitle: "Analytics & Improvement",
          details: "To understand usage patterns and improve our platform's functionality and user experience.",
        },
      ],
    },
    {
      title: "Information Sharing",
      icon: Users,
      color: "green",
      content: [
        {
          subtitle: "Public Content",
          details: "Approved PDFs, titles, descriptions, and your email (as uploader) are visible to all users.",
        },
        {
          subtitle: "No Third-Party Sales",
          details: "We never sell, rent, or trade your personal information to third parties for marketing purposes.",
        },
        {
          subtitle: "Legal Requirements",
          details: "We may disclose information when required by law or to protect our rights and users' safety.",
        },
        {
          subtitle: "Service Providers",
          details: "We use trusted services (Supabase, Vercel) that help us operate the platform securely.",
        },
      ],
    },
    {
      title: "Data Security",
      icon: Lock,
      color: "red",
      content: [
        {
          subtitle: "Encryption",
          details: "All data is encrypted in transit and at rest using industry-standard security measures.",
        },
        {
          subtitle: "Access Controls",
          details: "Strict access controls ensure only authorized personnel can access user data.",
        },
        {
          subtitle: "Regular Audits",
          details: "We regularly review and update our security practices to protect your information.",
        },
        {
          subtitle: "Incident Response",
          details: "We have procedures in place to quickly respond to and mitigate any security incidents.",
        },
      ],
    },
  ]

  const rights = [
    "Access your personal data and download a copy",
    "Correct inaccurate or incomplete information",
    "Delete your account and associated data",
    "Restrict processing of your information",
    "Object to certain uses of your data",
    "Data portability for your uploaded content",
  ]

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
                  Privacy Policy
                </h1>
                <p className="text-sm text-slate-600">How we protect and handle your information</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Last Updated: {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Your Privacy Matters</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We're committed to protecting your privacy and being transparent about how we collect, use, and protect your
            information on EduResources.
          </p>
        </div>

        {/* Key Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 text-center">
            <CardContent className="pt-6">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-900 mb-2">Privacy First</h3>
              <p className="text-blue-700 text-sm">Your data is protected with enterprise-grade security</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 text-center">
            <CardContent className="pt-6">
              <Eye className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-900 mb-2">Transparency</h3>
              <p className="text-purple-700 text-sm">Clear information about what we collect and why</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-900 mb-2">Your Control</h3>
              <p className="text-green-700 text-sm">You have full control over your data and privacy settings</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => (
            <Card key={index} className="border-purple-200/50 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-${section.color}-100 to-${section.color}-200 rounded-xl flex items-center justify-center`}
                  >
                    <section.icon className={`w-6 h-6 text-${section.color}-600`} />
                  </div>
                  <CardTitle className="text-2xl text-slate-900">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="space-y-2">
                      <h4 className="font-semibold text-slate-900">{item.subtitle}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.details}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Your Rights */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-purple-600" />
              Your Rights
            </CardTitle>
            <CardDescription className="text-lg">
              You have the following rights regarding your personal information:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rights.map((right, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="text-slate-700">{right}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900 flex items-center">
              <Cookie className="w-6 h-6 mr-3 text-orange-600" />
              Cookies & Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Essential Cookies</h4>
                <p className="text-slate-600 text-sm">
                  Required for authentication, security, and basic platform functionality.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Analytics Cookies</h4>
                <p className="text-slate-600 text-sm">
                  Help us understand how users interact with our platform to improve the experience.
                </p>
              </div>
            </div>
            <p className="text-slate-600 text-sm">
              You can control cookie preferences through your browser settings. Note that disabling essential cookies
              may affect platform functionality.
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-slate-900">Questions About Privacy?</CardTitle>
            <CardDescription className="text-lg">
              We're here to help you understand how we protect your information
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="mailto:privacy@eduresources.com">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Privacy Team
                </Button>
              </Link>
              <Link href="https://whatsapp.com/channel/0029VbAoenUEQIamfDBKsT2x" target="_blank">
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 bg-transparent"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Support
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-500">
              For privacy-related requests, please allow 5-10 business days for a response
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
